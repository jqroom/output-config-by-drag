let tpl = `
<div class="form-group">
    <div class="input-group mb-3">
        <div class="input-group-prepend">
            <button class="btn btn-outline-secondary collapseBtn" type="button">
                ${ myIcons.chevronDown }
            </button>
        </div>
        <input type="text" class="form-control" placeholder="请输入规则内容" aria-label="title">
        <div class="input-group-append">
            <button class="btn btn-outline-secondary addSiblings" type="button">+兄弟</button>
            <button class="btn btn-outline-secondary addChilds" type="button">+孩子</button>
            <button data-toggle="modal" data-target="#deleteNodePop" class="btn btn-outline-secondary" type="button">${ myIcons.trashcan }</button>
            <span class="input-group-text dragBtn">${ myIcons.threeBars }</span>
        </div>
    </div>
</div>`;

let $deleteTag = '';

function init() {
    bindNodeEvents();
    bindDragEvents();

    $('#configForm').append(tpl);

    bindCopyEvents();
    bindFileEvents();
}

function bindFileEvents() {
    let $fileInfo = $('#fileInfo');

    $('#inputFile').on('change', function (event) {
        let file = this.files[0];

        if (file && (file.type == 'application/json' || file.type == 'text/javascript')) {
            let reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function (evt) {
                let result = evt.target.result;
                if (result.indexOf('=') > 0) {
                    result = result.split('=')[1]; // 获取等号(=)后的json数据字符串
                }
                let jsonData = {};
                try {
                    jsonData = JSON.parse(result);
                } catch (e) {
                    console.log('文件数据解析失败！', e);
                }
                console.log(jsonData && jsonData['1']);
            }
            reader.onerror = function (evt) {
                console.log("文件加载失败！");
            }
            $fileInfo.text(`${ file.name }  ${ getFriendlySize(file.size) }`);
        } else {
            console.log('请选择一个js或者json后缀的文件！');
        }
    });

    $('.downloadBtn').on('click', function(){
        let type = $(this).data('type');
        if(type == 'js'){
            download('text/javascript');
        }else if(type == 'json'){
            download('application/json');
        }
    });
}

function getFriendlySize(nBytes) {
    let sOutput = nBytes + " bytes";
    // optional code for multiples approximation
    for (let aMultiples = ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
        sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] + " (" + nBytes + " bytes)";
    }

    return sOutput;
}

// 下载文件
function setDownloadUrl(target, text, name, type) {
    target.href = URL.createObjectURL(new Blob([text], { type: type }));
    target.download = name;
}

function bindCopyEvents() {
    $('.copyBtn').tooltip({
        title: '复制成功',
        placement: 'bottom',
        trigger: 'click'
    });

    let tooltipsTimer = null;
    let clipboard = new ClipboardJS('.copyBtn');

    clipboard.on('success', function () {
        clearTimeout(tooltipsTimer);
        $('.copyBtn').tooltip('show');
        tooltipsTimer = setTimeout(() => {
            $('.copyBtn').tooltip('hide');
        }, 1000);
    });
}

function bindNodeEvents() {
    $(document).on('click', '.addSiblings', function () {
        let $this = $(this);
        let $closestFormGroup = $this.parents('.form-group').eq(0);
        $closestFormGroup.parent().append(tpl);
    }).on('click', '.addChilds', function () {
        let $this = $(this);
        let $closestFormGroup = $this.parents('.form-group').eq(0);
        let curTpl = tpl;
        if ($closestFormGroup.find('>.childContent').size() <= 0) {
            curTpl = `<div class="childContent ml-3 collapse show">${ curTpl }</div>`
        } else {
            $closestFormGroup = $closestFormGroup.find('>.childContent').addClass('show');
            $closestFormGroup.find('>.collapseBtn').html(myIcons.chevronDown);
        }
        $closestFormGroup.append(curTpl);
    }).on('mouseenter', '.dragBtn', function () {
        $(this).parents('.form-group').eq(0).attr('draggable', "true");
    }).on('mouseleave', '.dragBtn', function () {
        $(this).parents('.form-group').eq(0).attr('draggable', "");
    }).on('click', '.collapseBtn', function () {
        let $this = $(this);
        let $closestFormGroup = $this.parents('.form-group').eq(0);
        let $toggleTarget = $closestFormGroup.find('>.childContent');

        if ($toggleTarget.hasClass('show')) {
            $toggleTarget.collapse('hide');
            $this.html(myIcons.triangleRight);
        } else {
            $toggleTarget.collapse('show');
            $this.html(myIcons.chevronDown);
        }
    });

    $('#deleteNodePop').on('show.bs.modal', function (event) {
        let $this = $(event.relatedTarget);
        let $closestFormGroup = $this.parents('.form-group').eq(0);
        $deleteTag = $closestFormGroup.addClass('delete-shadow');
    }).on('hide.bs.modal', function (event) {
        $deleteTag.removeClass('delete-shadow');
    }).on('click', '.deleteBtn', function () {
        $('#deleteNodePop').modal('hide')
        $deleteTag.remove();
    });

    $('#outputPop').on('show.bs.modal', function (event) {
        let type = $(event.relatedTarget).data('type');
        let config = {};
        if (type == 'way1') {
            config = outputConfig();
        } else if (type == 'way2') {
            config = outputConfig2();
        }
        let stringConfig = JSON.stringify(config, null, 4);

        setDownloadUrl($('.jsDownloadBtn')[0], `var config = ${ stringConfig };`, 'config', 'text/javascript');
        setDownloadUrl($('.jsonDownloadBtn')[0], stringConfig, 'config', 'application/json');
        setDownloadUrl($('.txtDownloadBtn')[0], stringConfig, 'config', 'text/plain');

        $('#outputPop').find('.modal-body').find('code').html(stringConfig);
    });
}

function bindDragEvents() {
    let $enterTag = '';
    let $leaveTag = '';
    let $dragged;
    let $configForm = $('#configForm');

    $configForm.on('dragstart', function (event) {
        // 保存拖动元素的引用(ref.)
        $dragged = $getCurTarget(event);
        $dragged.css('opacity', '.5'); // 使其半透明
    }).on('dragover', function (event) {
        // prevent default to allow drop
        event.preventDefault();
    }).on('dragenter', function (event) {
        $enterTag = $getCurTarget(event);
        if (!$enterTag.hasClass('form-group') || !$dragged) {
            event.stopPropagation();
            event.preventDefault();
            return;
        }
        if ($enterTag.is($dragged) || $.contains($dragged[0], $enterTag[0])) {
            return false;
        }
        $enterTag.addClass('shadow');
    }).on('dragleave', function (event) {
        $leaveTag = $getCurTarget(event);

        if (!$leaveTag.hasClass('form-group') || !$dragged) {
            event.stopPropagation();
            event.preventDefault();
            return;
        }

        if ($leaveTag.is($dragged) || $.contains($dragged[0], $leaveTag[0]) || $leaveTag.is($enterTag)) {
            return false;
        }

        $leaveTag.removeClass('shadow');
    }).on('dragend', function (event) {
        if (!$dragged) {
            return;
        }
        // 重置透明度
        $('.shadow').removeClass('shadow');
        $dragged.attr('draggable', "").css('opacity', '');
    }).on('drop', function (event) {
        // 阻止默认动作（如打开一些元素的链接）
        event.preventDefault();

        if (!$dragged) {
            return;
        }

        let $curTarget = $getCurTarget(event);

        if ($curTarget.is($dragged) || $.contains($dragged[0], $curTarget[0])) {
            return false;
        }

        $curTarget.before($dragged.css('opacity', '').remove()).focus();
    });
}

function $getCurTarget(target) {
    let $curTarget = $(event.target);

    if ($curTarget.hasClass('form-group')) {
        $curTarget = $curTarget;
    } else if ($curTarget.hasClass('childContent')) {
        $curTarget = $curTarget.find('.form-group').eq(0);
    } else {
        $curTarget = $curTarget.parents('.form-group').eq(0);
    }

    return $curTarget;
}

function getCurNavIndex(target, type) {
    let $target = $(target);
    let levelArr = [$target.index() + 1];
    let $parensFormGroup = $(target).parents('.form-group');
    $parensFormGroup.each((index, value) => {
        levelArr.push($(value).index() + 1);
    });

    if (type == 'addSibling') {
        levelArr.pop();
        levelArr.push($target.siblings().size() + 2); // 漏了自己和新增的那个，所以要加2
    } else if (type == 'addChild') {
        levelArr.push($target.find('>.childContent').find('>.form-group').size() + 1); // 漏了自己和新增的那个，所以要加2
    }

    return levelArr; // 倒序从里到外
}

// 第一种方案生成json数据
function outputConfig() {
    console.time('way1');
    let config = {};

    $('.form-group').each((i, v) => {
        let curIndexArr = getCurNavIndex(v);
        let objIndexArr = [].concat(curIndexArr).reverse();
        let curObj = curIndexArr.reduce((last, cur) => ({
            [cur]: last
        }), {
            index: objIndexArr.join('.'),
            value: $(v).find('>.input-group').find('>input').val()
        });

        mergeDeep(config, curObj);
    });

    console.timeEnd('way1');
    return config;
}

function mergeDeep(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (getType(target) == 'object' && getType(source) == 'object') {
        for (const key in source) {
            if (getType(source[key]) == 'object') {
                if (!target[key]) {
                    Object.assign(target, {
                        [key]: {}
                    });
                }
                mergeDeep(target[key], source[key]);
            } else {
                Object.assign(target, {
                    [key]: source[key]
                });
            }
        }
    }

    return mergeDeep(target, ...sources);
}

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLocaleLowerCase();
}


// 第二种方案获取生成json数据
function outputConfig2() {
    console.time('way2');
    let config = {}

    recursive($('#configForm'), config);

    console.timeEnd('way2');
    return config;
}

// 深度优先的遍历方式
function recursive($target, lastConfig, lastIndexArr = []) {
    $target.find('>.form-group').each((i, v) => {
        let indexArr = [].concat(lastIndexArr); // 创造一个新数组，这样就不会对之前的数据有影响
        indexArr.push(i + 1);

        lastConfig[i + 1] = {
            index: indexArr.join('.'),
            value: $(v).find('>.input-group').find('>input').val()
        }

        if ($(v).find('>.childContent').size() > 0) {
            recursive($(v).find('>.childContent'), lastConfig[i + 1], indexArr);
        }
    });
}

init();
