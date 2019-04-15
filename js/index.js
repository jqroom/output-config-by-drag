let downTpl = `<svg height="16" class="octicon octicon-chevron-down" viewBox="0 0 10 16" version="1.1" width="10" aria-hidden="true"><path fill-rule="evenodd" d="M5 11L0 6l1.5-1.5L5 8.25 8.5 4.5 10 6l-5 5z"></path></svg>`;
let rightTpl = `<svg height="16" class="octicon octicon-chevron-right" viewBox="0 0 8 16" version="1.1" width="8" aria-hidden="true"> <path fill-rule="evenodd" d="M7.5 8l-5 5L1 11.5 4.75 8 1 4.5 2.5 3l5 5z"></path> </svg>`;
let tpl = `
    <div class="form-group">
        <div class="input-group mb-3">
            <div class="input-group-prepend">
                <button class="btn btn-outline-secondary" type="button">
                    ${ downTpl }
                </button>
            </div>
            <input type="text" class="form-control" placeholder="请输入规则内容" aria-label="title">
            <div class="input-group-append">
                <button class="btn btn-outline-secondary addSiblings" type="button">+兄弟</button>
                <button class="btn btn-outline-secondary addChilds" type="button">+孩子</button>
                <span class="input-group-text dragBtn">
                    <svg height="16" class="octicon octicon-three-bars" viewBox="0 0 12 16" version="1.1" width="8" aria-hidden="true"> <path fill-rule="evenodd" d="M11.41 9H.59C0 9 0 8.59 0 8c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zm0-4H.59C0 5 0 4.59 0 4c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zM.59 11H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1H.59C0 13 0 12.59 0 12c0-.59 0-1 .59-1z"></path> </svg>
                </span>
            </div>
        </div>
    </div>`;
let placeTagHtml = `<hr class="placeTag border border-danger">`;

function init() {
    bindNodeEvents();
    bindDragEvents();

    $('#configForm').append(tpl);
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
        if ($closestFormGroup.find('.childContent').size() <= 0) {
            curTpl = `<div class="childContent ml-3">${ tpl }</div>`
        } else {
            $closestFormGroup = $closestFormGroup.find('.childContent');
        }
        $closestFormGroup.append(curTpl);
    }).on('mouseenter', '.dragBtn', function () {
        $(this).parents('.form-group').eq(0).attr('draggable', "true");
    }).on('mouseleave', '.dragBtn', function () {
        $(this).parents('.form-group').eq(0).attr('draggable', "");
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
        if ($enterTag.is($dragged) || $.contains($dragged[0], $enterTag[0])) {
            return false;
        }
        $('.placeTag').remove();
        $enterTag.before(placeTagHtml);
    }).on('dragleave', function (event) {
        $leaveTag = $getCurTarget(event);
        if ($leaveTag.is($dragged) || $.contains($dragged[0], $leaveTag[0]) || $leaveTag.is($enterTag)) {
            return false;
        }

        $leaveTag.prev('.placeTag').remove();
    }).on('dragend', function (event) {
        // 重置透明度
        $dragged.attr('draggable', "").css('opacity', '');
    }).on('drop', function (event) {
        // 阻止默认动作（如打开一些元素的链接）
        event.preventDefault();
        let $curTarget = $getCurTarget(event);

        $curTarget.prev('.placeTag').remove();

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

init();
