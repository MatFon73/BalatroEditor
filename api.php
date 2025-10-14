<?php

if (ob_get_level()) ob_end_clean();
ob_start();

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

$BALATRO_EDITOR_PATH = __DIR__ . '/BalatroSaveEditor';
$MAIN_PY = $BALATRO_EDITOR_PATH . '/main.py';

$python_cmd = 'C:\\Users\\mateo\\AppData\\Local\\Programs\\Python\\Python313\\python.exe';

$python_test = shell_exec("\"$python_cmd\" --version 2>&1");
if ($python_test !== null && strpos($python_test, 'Python') !== false) {
    error_log("Python found: " . trim($python_test));
} else {
    error_log("ERROR: Python not accessible at: $python_cmd");
}

function json_to_jkr($json_data) {
    global $BALATRO_EDITOR_PATH, $MAIN_PY, $python_cmd;
    
    try {
        if ($python_cmd === null) {
            throw new Exception('Python is not available');
        }
        
        if (!is_array($json_data) && !is_object($json_data)) {
            throw new Exception('Invalid JSON data format');
        }
        
        $is_meta = isset($json_data['unlocked']) || isset($json_data['discovered']) || isset($json_data['alerted']);
        $is_profile = isset($json_data['career_stats']) || isset($json_data['high_scores']) || isset($json_data['name']);
        
        if (!$is_meta && !$is_profile) {
            error_log('Invalid data structure. Keys found: ' . implode(', ', array_keys((array)$json_data)));
            throw new Exception('Invalid data structure: must be either meta.jkr or profile.jkr format');
        }
        
        error_log('Detected file type: ' . ($is_meta ? 'meta.jkr' : 'profile.jkr'));
        
        $temp_dir = sys_get_temp_dir();
        if (!is_writable($temp_dir)) {
            throw new Exception("Temp directory is not writable: $temp_dir");
        }
        
        $unique_id = uniqid('balatro_', true);
        $json_temp = $temp_dir . DIRECTORY_SEPARATOR . $unique_id . '.json';
        $jkr_temp = $temp_dir . DIRECTORY_SEPARATOR . $unique_id . '.jkr';
        
        error_log("Creating temp files: JSON=$json_temp, JKR=$jkr_temp");
        
        $json_content = json_encode($json_data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        if ($json_content === false) {
            throw new Exception('Failed to encode JSON: ' . json_last_error_msg());
        }
        
        $bytes_written = file_put_contents($json_temp, $json_content);
        if ($bytes_written === false) {
            throw new Exception('Failed to write JSON temp file');
        }
        
        error_log("Written $bytes_written bytes to JSON temp file");
        
        if (!file_exists($MAIN_PY)) {
            throw new Exception("BalatroSaveEditor not found at: $MAIN_PY");
        }
        
        $command = sprintf(
            'cd %s && %s %s import %s -o %s 2>&1',
            escapeshellarg($BALATRO_EDITOR_PATH),
            $python_cmd,
            escapeshellarg($MAIN_PY),
            escapeshellarg($json_temp),
            escapeshellarg($jkr_temp)
        );
        
        error_log("Executing command: $command");
        
        $output = [];
        $return_code = 0;
        exec($command, $output, $return_code);
        
        $output_str = implode("\n", $output);
        error_log("Python output: $output_str");
        error_log("Return code: $return_code");
        
        if ($return_code !== 0) {
            @unlink($json_temp);
            @unlink($jkr_temp);
            
            return [
                'success' => false,
                'error' => 'Python conversion failed',
                'details' => $output_str,
                'return_code' => $return_code
            ];
        }
        
        if (!file_exists($jkr_temp)) {
            @unlink($json_temp);
            return [
                'success' => false,
                'error' => 'JKR file was not created'
            ];
        }
        
        $jkr_content = file_get_contents($jkr_temp);
        if ($jkr_content === false) {
            @unlink($json_temp);
            @unlink($jkr_temp);
            throw new Exception('Failed to read JKR file');
        }
        
        error_log("Successfully generated JKR file, size: " . strlen($jkr_content) . " bytes");
        
        $jkr_base64 = base64_encode($jkr_content);
        
        @unlink($json_temp);
        @unlink($jkr_temp);
        
        return [
            'success' => true,
            'jkr_content' => $jkr_base64,
            'encoding' => 'base64'
        ];
        
    } catch (Exception $e) {
        error_log("Exception in json_to_jkr: " . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

function jkr_to_json($jkr_content) {
    global $BALATRO_EDITOR_PATH, $MAIN_PY, $python_cmd;
    
    try {
        if ($python_cmd === null) {
            throw new Exception('Python is not available');
        }
        
        if (empty($jkr_content)) {
            throw new Exception('Empty JKR content');
        }
        
        // Check if base64
        if (base64_encode(base64_decode($jkr_content, true)) === $jkr_content) {
            $jkr_content = base64_decode($jkr_content);
            error_log("Decoded base64 JKR content");
        }
        
        $temp_dir = sys_get_temp_dir();
        $unique_id = uniqid('balatro_', true);
        $jkr_temp = $temp_dir . DIRECTORY_SEPARATOR . $unique_id . '.jkr';
        $json_temp = $temp_dir . DIRECTORY_SEPARATOR . $unique_id . '.json';
        
        error_log("Creating temp files for JKR import: JKR=$jkr_temp, JSON=$json_temp");
        
        file_put_contents($jkr_temp, $jkr_content);
        
        $command = sprintf(
            'cd %s && %s %s export %s -o %s 2>&1',
            escapeshellarg($BALATRO_EDITOR_PATH),
            $python_cmd,
            escapeshellarg($MAIN_PY),
            escapeshellarg($jkr_temp),
            escapeshellarg($json_temp)
        );
        
        error_log("Executing command: $command");
        
        $output = [];
        $return_code = 0;
        exec($command, $output, $return_code);
        
        $output_str = implode("\n", $output);
        error_log("Python output: $output_str");
        
        if ($return_code !== 0) {
            @unlink($jkr_temp);
            @unlink($json_temp);
            
            return [
                'success' => false,
                'error' => 'Python conversion failed',
                'details' => $output_str
            ];
        }
        
        if (!file_exists($json_temp)) {
            @unlink($jkr_temp);
            return [
                'success' => false,
                'error' => 'JSON file was not created'
            ];
        }
        
        $json_content = file_get_contents($json_temp);
        $json_data = json_decode($json_content, true);
        
        if ($json_data === null) {
            @unlink($jkr_temp);
            @unlink($json_temp);
            return [
                'success' => false,
                'error' => 'Failed to decode JSON: ' . json_last_error_msg()
            ];
        }
        
        @unlink($jkr_temp);
        @unlink($json_temp);
        
        return [
            'success' => true,
            'data' => $json_data
        ];
        
    } catch (Exception $e) {
        error_log("Exception in jkr_to_json: " . $e->getMessage());
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

$endpoint = $_GET['endpoint'] ?? '';
ob_end_clean();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raw_input = file_get_contents('php://input');
    error_log("Received input: " . substr($raw_input, 0, 500));
    
    $input = json_decode($raw_input, true);
    
    if ($input === null && json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON input: ' . json_last_error_msg()
        ]);
        exit;
    }
    
    switch ($endpoint) {
        case 'json-to-jkr':
            $result = json_to_jkr($input);
            echo json_encode($result);
            break;
            
        case 'jkr-to-json':
            $jkr_content = $input['jkr_content'] ?? '';
            $result = jkr_to_json($jkr_content);
            echo json_encode($result);
            break;
            
        default:
            http_response_code(404);
            echo json_encode([
                'success' => false,
                'error' => 'Endpoint not found: ' . $endpoint
            ]);
            break;
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET' && $endpoint === 'health') {
    echo json_encode([
        'status' => 'ok',
        'python_command' => $python_cmd,
        'balatro_editor_found' => file_exists($MAIN_PY),
        'balatro_editor_path' => $MAIN_PY,
        'python_available' => $python_cmd !== null,
        'temp_dir' => sys_get_temp_dir(),
        'temp_writable' => is_writable(sys_get_temp_dir())
    ]);
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Method not allowed'
    ]);
}