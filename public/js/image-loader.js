const IMAGE_CACHE_KEY = 'balatro_img_cache';
const PLACEHOLDER_SVG = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22%3E%3Crect fill=%22%23222%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E';

const BASE_URLS = [
    'https://balatrowiki.org/images/'
];

const EXCEPTIONAL_IMAGE_URLS = {
    'modifiers:e_holo': 'https://static.wikia.nocookie.net/balatrogame/images/0/07/Hologram.gif'
};

const SPECIAL_CASES = {
    jokers: {
        'joker': 'Joker.png',
        'stencil': 'Joker_Stencil.png',
        'trousers': 'Spare_Trousers.png',
        'mime': 'Mime.png',
        'cloud_9': 'Cloud_9.png',
        'mail': 'Mail-In_Rebate.png',
        'four_fingers': 'Four_Fingers.png',
        'seance': 'Séance.png',
        'mr_bones': 'Mr._Bones.png',
        'caino': 'Canio.png',
        'chaos': 'Chaos_the_Clown.png',
        'drivers_license': "Driver's_License.png",
        'baseball': 'Baseball_Card.png',
        'business': 'Business_Card.png',
        'trading': 'Trading_Card.png',
        'flash': 'Flash_Card.png',
        'gift': 'Gift_Card.png',
        'ceremonial': 'Ceremonial_Dagger.png',
        'perkeo': 'Perkeo.png',
        'chicot': 'Chicot.png',
        'triboulet': 'Triboulet.png',
        'yorick': 'Yorick.png',
        'idol': 'The_Idol.png',
        'family': 'The_Family.png',
        'order': 'The_Order.png',
        'tribe': 'The_Tribe.png',
        'delayed_grat': 'Delayed_Gratification.png',
        'gluttenous_joker': 'Gluttonous_Joker.png',
        'duo': 'The_Duo.png',
        'trio': 'The_Trio.png',
        'oops': 'Oops!_All_6s.png',
        'dna': 'DNA.png',
        'hit_the_road': 'Hit_the_Road.png',
        'ride_the_bus': 'Ride_the_Bus.png',
        'riff_raff': 'Riff-Raff.png',
        'ring_master': 'Showman.png',
        'selzer': 'Seltzer.png',
        'smiley': 'Smiley_Face.png',
        'sock_and_buskin': 'Sock_and_Buskin.png',
        'shoot_the_moon': 'Shoot_the_Moon.png',
        'ticket': 'Golden_Ticket.png',
        'to_the_moon': 'To_the_Moon.png',
        'todo_list': 'To_Do_List.png'
    },
    vouchers: {
        'directors_cut': "Director's_Cut.png",
        'overstock_norm': 'Overstock.png'
    },
    planets: { 'soul': 'The_Soul.png' },
    spectrals: { 'soul': 'The_Soul.png' },
    modifiers: {
        'negative': 'Joker_(Negative).png',
        'base': 'Joker.png'
    },
    blinds: {
        'small': 'Small_Blind.png',
        'big': 'Big_Blind.png',
        'final_acorn': 'Amber_Acorn.png',
        'final_bell': 'Verdant_Leaf.png',
        'final_heart': 'Violet_Vessel.png',
        'final_leaf': 'Crimson_Heart.png',
        'final_vessel': 'Cerulean_Bell.png'
    },
    tags: {
        'top_up': 'Top-up_Tag.png',
        'd_six': 'D6_Tag.png',
        'skip': 'Speed_Tag.png',
        'holo': 'Holographic_Tag.png'
    },
    tarots: {
        'death': 'Death.png',
        'heirophant': 'The_Hierophant.png',
        'justice': 'Justice.png',
        'strength': 'Strength.png',
        'temperance': 'Temperance.png',
        'wheel_of_fortune': 'The_Wheel_of_Fortune.png',
        'judgement': 'Judgement.png'
    }
};

function getExceptionalImageUrl(id, category) {
    return EXCEPTIONAL_IMAGE_URLS[category + ':' + id] || null;
}

function getSpecialFileName(id, category) {
    const cleanId = id.replace(/^(j_|v_|c_|m_|e_|bl_|tag_)/, '');
    return SPECIAL_CASES[category]?.[cleanId] || null;
}

function getImageUrls(id, category) {
    const exceptionalUrl = getExceptionalImageUrl(id, category);
    if (exceptionalUrl) return [exceptionalUrl];

    const wikiName = formatName(id).replace(/ /g, '_');
    const urls = [];

    const specialFile = getSpecialFileName(id, category);
    if (specialFile) {
        for (const base of BASE_URLS) {
            urls.push(base + specialFile);
        }
    }

    switch (category) {
        case 'jokers':
            for (const base of BASE_URLS) {
                urls.push(base + wikiName + '_Joker.png');
            }
            for (const base of BASE_URLS) {
                urls.push(base + wikiName + '.png');
            }
            break;
        case 'vouchers':
            for (const base of BASE_URLS) {
                urls.push(base + wikiName + '.png');
            }
            break;
        case 'decks':
            for (const base of BASE_URLS) {
                urls.push(base + wikiName + '_Deck.png');
            }
            break;
        case 'planets':
        case 'spectrals':
        case 'tarots':
            for (const base of BASE_URLS) {
                urls.push(base + 'The_' + wikiName + '.png');
            }
            for (const base of BASE_URLS) {
                urls.push(base + wikiName + '.png');
            }
            break;
        case 'modifiers':
            if (id.startsWith('m_')) {
                for (const base of BASE_URLS) {
                    urls.push(base + wikiName + '_Card.png');
                }
            } else {
                for (const base of BASE_URLS) {
                    urls.push(base + wikiName + '.png');
                }
            }
            break;
        case 'blinds':
            for (const base of BASE_URLS) {
                urls.push(base + 'The_' + wikiName + '.png');
            }
            for (const base of BASE_URLS) {
                urls.push(base + wikiName + '.png');
            }
            break;
        case 'tags':
            for (const base of BASE_URLS) {
                urls.push(base + wikiName + '_Tag.png');
            }
            break;
        default:
            for (const base of BASE_URLS) {
                urls.push(base + wikiName + '.png');
            }
    }

    return [...new Set(urls)];
}

function getImageCache() {
    try {
        return JSON.parse(localStorage.getItem(IMAGE_CACHE_KEY) || '{}');
    } catch {
        return {};
    }
}

function saveImageCache(cache) {
    try {
        localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cache));
    } catch {
    }
}

function loadImage(imgElement, id, category) {
    const cacheKey = category + ':' + id;
    const cache = getImageCache();

    if (cache[cacheKey]) {
        imgElement.src = cache[cacheKey];
        imgElement.removeAttribute('data-src');
        return;
    }

    const urls = getImageUrls(id, category);
    tryUrlChain(imgElement, urls, 0, category, id);
}

function tryUrlChain(imgElement, urls, index, category, id) {
    if (index >= urls.length) {
        imgElement.removeAttribute('data-src');
        return;
    }

    const url = urls[index];

    imgElement.onload = function onLoad() {
        imgElement.onload = null;
        imgElement.onerror = null;
        const cache = getImageCache();
        cache[category + ':' + id] = url;
        saveImageCache(cache);
        imgElement.removeAttribute('data-src');
    };

    imgElement.onerror = function onError() {
        imgElement.onload = null;
        imgElement.onerror = null;
        tryUrlChain(imgElement, urls, index + 1, category, id);
    };

    imgElement.src = url;
}

function loadImagesInContainer(container) {
    container.querySelectorAll('img[data-src]').forEach(img => {
        const id = img.dataset.id;
        const category = img.dataset.category;
        if (id && category) {
            loadImage(img, id, category);
        }
    });
}
