let tpl = `
        <div class="form-group">
            <div class="input-group mb-3">
                <div class="input-group-prepend">
                    <button class="btn btn-outline-secondary" type="button">
                        <svg height="16" class="octicon octicon-chevron-right" viewBox="0 0 8 16" version="1.1" width="8" aria-hidden="true">
                            <path fill-rule="evenodd" d="M7.5 8l-5 5L1 11.5 4.75 8 1 4.5 2.5 3l5 5z"></path>
                        </svg>
                    </button>
                </div>
                <input type="text" class="form-control" placeholder="请输入规则内容" aria-label="title">
                <div class="input-group-append">
                    <button class="btn btn-outline-secondary addSiblings" type="button">+兄弟</button>
                    <button class="btn btn-outline-secondary addChilds" type="button">+孩子</button>
                    <button class="btn btn-outline-secondary dragBtn" type="button">
                        <svg height="16" class="octicon octicon-three-bars" viewBox="0 0 12 16" version="1.1" width="8" aria-hidden="true">
                            <path fill-rule="evenodd" d="M11.41 9H.59C0 9 0 8.59 0 8c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zm0-4H.59C0 5 0 4.59 0 4c0-.59 0-1 .59-1H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1h.01zM.59 11H11.4c.59 0 .59.41.59 1 0 .59 0 1-.59 1H.59C0 13 0 12.59 0 12c0-.59 0-1 .59-1z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>`;

function init() {
    bindNodeEvents();
    bindDragEvents();
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
    let $dragged;
    let $configForm = $('#configForm');

    $configForm.on('dragstart', function (event) {
        // 保存拖动元素的引用(ref.)
        if($(event.target).hasClass('form-group')){
            $dragged = $(event.target);
            // 使其半透明
            event.target.style.opacity = .5;
        }
    }).on('dragover', function (event) {
        // prevent default to allow drop
        event.preventDefault();
    }).on('dragenter', function (event) {
        event.target.style.background = "purple";
    }).on('dragleave', function (event) {
        event.target.style.background = "";
    }).on('dragend', function (event) {
        // 重置透明度
        // event.target.style.background = "";
        $dragged.attr('draggable', "").css('opacity', '');
    }).on('drop', function (event) {
        // 阻止默认动作（如打开一些元素的链接）
        event.preventDefault();
        let $curTarget = $(event.target);
        // let $curTargetParent = $curTarget.parent();

        event.target.style.background = "";

        if ($curTarget.hasClass('form-group')) {
            if($curTarget.find('.childContent').size() > 0){
                $curTarget.find('.childContent').prepend($dragged.css('opacity', '').remove());
            }else{
                $curTarget.before($dragged.css('opacity', '').remove());
            }
        } else if ($curTarget.hasClass('childContent')) {
            $curTarget.before($dragged.css('opacity', '').remove());
        }else{
            $curTarget = $curTarget.parents('.form-group').eq(0);
            $curTarget.before($dragged.css('opacity', '').remove());
        }
    });
}

init();
