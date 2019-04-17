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

    $('#deleteNodePop').on('show.bs.modal', function(event){
        let $this = $(event.relatedTarget);
        let $closestFormGroup = $this.parents('.form-group').eq(0);
        $deleteTag = $closestFormGroup.addClass('delete-shadow');
    }).on('hide.bs.modal', function(event){
        $deleteTag.removeClass('delete-shadow');
    }).on('click', '.deleteBtn', function () {
        $('#deleteNodePop').modal('hide')
        $deleteTag.remove();
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
        $enterTag.addClass('shadow');
    }).on('dragleave', function (event) {
        $leaveTag = $getCurTarget(event);
        if ($leaveTag.is($dragged) || $.contains($dragged[0], $leaveTag[0]) || $leaveTag.is($enterTag)) {
            return false;
        }

        $leaveTag.removeClass('shadow');
    }).on('dragend', function (event) {
        // 重置透明度
        $('.shadow').removeClass('shadow');
        $dragged.attr('draggable', "").css('opacity', '');
    }).on('drop', function (event) {
        // 阻止默认动作（如打开一些元素的链接）
        event.preventDefault();
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

    return levelArr;
}

function getFormatSelector(arr) {
    return `.form-group:eq(${ arr.reduce((sum, cur) => sum + cur, 0) - 1 }) > .childContent`;
}

function getType(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1).toLocaleLowerCase();
}

init();
