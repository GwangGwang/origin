var telegram = require('telegram-bot-api');
var api = new telegram({
    token: '265841140:AAHsi5oowfGt5vtkenclNFA5xsHnvfHcvdo',
    updates: {
        enabled: true,
        get_interval: 1000
    }
});

var shutUp = false;

api.on('message', function(message)
{
    var chat_id = message.chat.id;

    // It'd be good to check received message type here
    // And react accordingly
    // We consider that only text messages can be received here

    var text = null;
    if (message) {
        console.log(message);
        if (!shutUp) {
            text = checkKeywordAndGetResponse(message.text);
        } else {
            var temp = checkKeywordAndGetResponse(message.text);
            if (!shutUp) text = temp;
        }
    }

    if (text === null) {
        // 할말없으면 10% 확률로 할말없을 때 하는 말을 말한다
        if (Math.random() < 0.02) {
            var texts = ['ㅇㅎ', ';', ';;', '하악'];
            text = texts[Math.floor(Math.random() * texts.length)];
        } else {
            return;
        }
    }

    api.sendMessage({
        chat_id: message.chat.id,
        text: text
    })
    .then(function(message)
    {
        console.log(message);
    })
    .catch(function(err)
    {
        console.log(err);
    });
});


var handleIrregulars = function(text) {
    for (var i = 0; i < irregularTable.length; i++) {
        var regex = new RegExp(irregularTable[i].pattern);
        var match = text.match(regex);
        if (match === null) continue;
        return (match.length > 1 ? text.replace(regex, '$1' + irregularTable[i].fix) : text.replace(regex, irregularTable[i].fix));
    }
    return text;
};

var behaviors = {

    pickOne: function(matchResult, list) {
        var response = list[Math.floor(Math.random() * list.length)].replace('$', matchResult[1]);
        return handleIrregulars(response)
    },
    
    humanOut: function(matchResult, params) {
        var outTexts = [
            'OUT!',
        ];
        return Math.random() < 0.2 ? params[0].replace('$', outTexts[Math.floor(Math.random() * outTexts.length)]) : null;
    },

    customPick: function(matchResult) {
        var optionText = matchResult.input.slice(matchResult[0].length + matchResult.index).trim();
        var options = optionText.split(',');
        if (options.length <= 1) {
            options = optionText.split(' ');
        }
        return options[Math.floor(Math.random() * options.length)].trim();
    },

    able: function() {
        var ableTexts = [
            '가능!',
            '매우 가능',
            'ㄱㄴ',
            'ㄲ',
            'ㄱㄱ',
            '불가능',
            'ㅂ',
            'ㅈㅅ',
            'ㅗ',
            'ㅂ2',
            'ㄴㄴ'
        ];
        return ableTexts[Math.floor(Math.random() * ableTexts.length)];
    },

    shutup: function() {
        var texts = ['닥칠게요... 히이잉', '알았어요.. 잘있어요', '닥치겠습니다', '셧업할게요', '내가 더러워서 말 안한다'];
        shutUp = true;
        return texts[Math.floor(Math.random() * texts.length)];
    },
    unshutup: function() {
        var texts = ['고마워요 꺄르륵!', '하잉', '데헷~', '영웅은 죽지 않아요', 'I have returned'];
        if (shutUp) {
            shutUp = false;
            return texts[Math.floor(Math.random() * texts.length)];
        }
    },
    tonight: function() {
        var texts = ['석양이.. 진다', '이것도 너프해 보시지', 'NERF THIS!!!', '하늘에서 정의가 빗발친다', '고요를 경험하시오', 'Experience tranquility', 'Pass into the Iris'
                    , '드랍더 비트!', '쀼삡쀼 뿌삡'];
        return texts[Math.floor(Math.random() * texts.length)];
    }
};

var checkKeywordAndGetResponse = function(text) {
    if (text === undefined) return null;

    // Check explicit commands first
    for (var i = 0; i < explicitCommands.length; i++) {
        var match = text.trim().match(new RegExp(explicitCommands[i].command));
        if (match === null) continue;
        return behaviors[explicitCommands[i].behavior](match, explicitCommands[i].parameter);
    }

    // Check keywords
    for (var i = 0; i < keywordList.length; i++) {
        var match = text.trim().match(new RegExp(keywordList[i].keyword));
        if (match === null) continue;
        return behaviors[keywordList[i].behavior](match, keywordList[i].parameter);
    }
    return null;
};

var explicitCommands = [
    { command: /^김가능!+\s?/, behavior: 'customPick' },
    { command: /^가능아!+\s?/, behavior: 'customPick' },
    { command: /^ㄱㄴ!+\s?/, behavior: 'customPick' },
    { keyword: /닥쳐*$/, behavior: 'shutup' },
    { keyword: /닥칠래\?*$/, behavior: 'shutup' },
    { keyword: /말해*$/, behavior: 'unshutup' },
];

var keywordList = [
    { keyword: /광승*$/, behavior: 'humanOut', parameter: ['김광승 $'] },
    { keyword: /형주*$/, behavior: 'humanOut', parameter: ['김형주 $'] },
    { keyword: /찬주*$/, behavior: 'humanOut', parameter: ['김찬주 $'] },
    { keyword: /은국*$/, behavior: 'humanOut', parameter: ['박은국 $'] },
    { keyword: /영하*$/, behavior: 'humanOut', parameter: ['안영하 $'] },

    { keyword: /가능\?\S*$/, behavior: 'able' },
    { keyword: /ㄱㄴ\?\S*$/, behavior: 'able' },


    { keyword: /ㅇㄴㅂ*$/, behavior: 'overwatch' },
    { keyword: /ㅇㅂㅇㅊ*$/, behavior: 'overwatch' },
    { keyword: /고급시계*$/, behavior: 'overwatch' },
];
