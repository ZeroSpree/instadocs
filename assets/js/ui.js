// Utils
function linkify(text) {
  var urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, function (url) {
    return '<a target="_blank" href="' + url + '">' + url + '</a>';
  });
}
function stripDoubleQuotes(text){
  return text.replace(/"/g, '&quot;');
}

// Local Storage
var app = {
    storage: {
      getData: function () {
        return JSON.parse(localStorage.getItem('instadocs')) || {
          'userdata': {
            'categories': []
          },
          'settings': {}
        };
      },
      setData: function () {
        localStorage.setItem('instadocs', JSON.stringify(_O || this.getData()));
      }
    },
    init: function () {
      this.storage.setData();

      var data = this.storage.getData(),
        stringData = '';

      for(var i in data.userdata.categories) {
        var cat = data.userdata.categories[i],
          categoryItems = '';

        for(var j in cat.items) {
          var item = cat.items[j];
          categoryItems += _item(item.title, item.def, item.id);
        }

        stringData += _category(cat.title, cat.id, categoryItems);
      }

      $('main')
        .html(stringData);
    }
  },
  _O = app.storage.getData();

function doSearch() {
  $('#search')
    .fusse({
      ct   : $('table'),
      keys : ['item__description', 'item__definition'],
      cls  : 'item--hidden'
    });

  $('table')
    .off()
    .on('fusse-search', function () {
      var $t = $(this);
      $t.toggleClass('item--hidden', $t.find('.item--hidden').length === $t.find('tbody tr').length);

      // bring back empty lists
      if($('#search').val() === ''){
        $('.item--hidden').removeClass('item--hidden');
      }
    });
}

// Overlay
function closeOverlay() {
  $('.overlay--visible')
    .removeAttr('data-catid')
    .removeAttr('data-itemid')
    .removeClass('overlay--visible');
}

function toggleOverlay(e) {
  var $t = $(e.target),
      which = $t.attr('data-overlay');

  if(!$('.overlay--visible').length) {
    var $overlay = $('.overlay--' + which);

    $overlay
      .addClass('overlay--visible')
      .find('.new__title,.new__description')
      .val('')
      .first()
      .focus();

    if(which == 'item' || which == 'remove') {
      $overlay.attr({
        'data-catid': $t.parents('table')
          .attr('data-id'),
        'data-itemid': $t.parents('tr')
          .attr('id')
      });

      // when editing an existing item
      var itemid = $overlay.attr('data-itemid');
      if(itemid) {
        $overlay
          .find('.new__title').val($('[id=' + itemid + '] .item__description').html())
          .end()
          .find('.new__description').val($('[id=' + itemid + '] .item__definition').text());
      }
    } else if(which == 'category') {
      var catid = $t.parents('table').attr('data-id');
      $overlay
        .attr('data-catid', catid)
        .find('.new__title')
        .val($('[data-id=' + catid + '] thead strong').html());
    }
  } else {
    closeOverlay();
  }
}

function submitCallback() {
  app.storage.setData();
  doSearch();
  closeOverlay();
  doSortable();
}

// Add/Edit Categories
function submitCategory(e) {
  e.preventDefault();

  var categoryTitle = $('#js-add-category').val(),
      categoryId = $('.overlay--visible').attr('data-catid');

  // Edit
  if(categoryId) {
    $('[data-id=' + categoryId + '] thead strong').text(categoryTitle);
    _O.userdata.categories[$('[data-id=' + categoryId + ']').index()].title = categoryTitle;
  }
  // Add
  else {
    var categoryId = $.now();

    $(_category(categoryTitle, categoryId, '')).prependTo('main');
    _O.userdata.categories.unshift({
      title : categoryTitle,
      items : [],
      id    : categoryId
    });
  }

  submitCallback();
}

// Add/Edit Items
function submitItem(e) {
  e.preventDefault();

  var itemTitle   = $('#js-add-item').val(),
      itemDef     = $('#js-add-item-description').val(),
      itemId      = $('.overlay--visible').attr('data-itemid'),
      categoryId  = $('.overlay--visible').attr('data-catid'),
      $itemParent = $('table[data-id=' + categoryId + ']'),
      parentIndex = $itemParent.index();

  // Edit
  if(itemId) {
    var $item = $('[id=' + itemId + ']'),
        oItem = _O.userdata.categories[parentIndex].items[$item.index()];

    $item.replaceWith(_item(itemTitle, itemDef, itemId));
    oItem.title = itemTitle;
    oItem.def = itemDef;
  }
  // Add
  else {
    var itemId = $.now();

    $(_item(itemTitle, itemDef, itemId)).prependTo($itemParent.find('tbody'));
    _O.userdata.categories[parentIndex].items.unshift({
      title : itemTitle,
      def   : itemDef,
      id    : itemId
    });
  }

  submitCallback();
}

// Remove Items & Categories
function submitRemove(e) {
  e.preventDefault();

  var categoryId    = $('.overlay--visible').attr('data-catid'),
      itemId        = $('.overlay--visible').attr('data-itemid'),
      $category     = $('table[data-id=' + categoryId + ']'),
      categoryIndex = $category.index();

  // Item
  if(itemId) {
    var $item = $('[id=' + itemId + ']');

    _O.userdata.categories[categoryIndex].items.splice($item.index(), 1);
    $item.remove();
  }
  // Category
  else {
    _O.userdata.categories.splice(categoryIndex, 1);
    $category.remove();
  }

  submitCallback();
}

// Handle ESC and Auto-search
function keyEvents(e) {
  // handle ESC key
  if(e.keyCode == 27) {
    if($('.overlay--visible').length) closeOverlay();
    else $('#search').val('').blur().trigger('keyup');
    return;
  }

  // If it wasn't an ESC key and forms are active, don't do anything
  if($('.overlay--visible').length || $('#search').is(':focus')) return;

  // if everything's cool and a LETTER was pressed, start auto-search
  if(event.keyCode >= 65 && event.keyCode <= 90) $('#search').focus();
}

// Make things sortable
function doSortable() {
  $('main')
    .sortable({
      axis   : 'y',
      handle : '.js-sort-category-handle',
      update : function () {
        refreshStorage();
      }
    });

  $('tbody')
    .sortable({
      axis        : 'y',
      connectWith : 'tbody',
      handle      : '.js-sort-item-handle',
      update      : function () {
        refreshStorage();
      }
    });
}

// Recreate local storage after sorting.
// TODO: do it the proper way, instead of reading the entire DOM.
function refreshStorage() {
  // clear existing data
  _O.userdata.categories = [];

  $.each($('table'), function () {
    var $t       = $(this),
        catId    = $t.attr('data-id'),
        catItems = [],
        $rows    = $t.find('tbody tr');

    $.each($rows, function () {
      var $row = $(this);

      catItems.push({
        def   : $row.find('.item__definition').text(),
        id    : $row.attr('id'),
        title : $row.find('.item__description').text()
      });
    });

    _O.userdata.categories.push({
      id    : catId,
      title : $t.find('thead strong').text(),
      items : catItems
    });
  });

  app.storage.setData();
}

// ZeroClipboard events
// https://github.com/zeroclipboard/jquery.zeroclipboard
var copyEvents = {
  'copy' : function(e) {
    e.clipboardData.clearData();
    e.clipboardData.setData("text/plain", $(this).attr('data-zclip-text'));
    e.preventDefault();
  },
  'aftercopy': function(e) {
    var status = (e.success['text/plain'] === true) ? 'ok' : 'fail';

    $('.clipboard-notice--'+status)
      .stop()
      .fadeIn(250, function(){
        $(this).delay(500).fadeOut(250);
      });
  }
};

// Item Menu Logic
function toggleItemMenu(e){
  var $trigger = $(e.target),
      $menuPlaceholder = $trigger.siblings('.js--menu-placeholder'),
      whichMenu = $trigger.attr('data-menu');

  // Toggle menu if clicking on the same js--open-menu-item 2nd time
  if($trigger.is('.js--open-item-menu') && $menuPlaceholder.find('.menu').length){
    $('.menu').remove();
  }
  else if ($trigger.is('.js--open-item-menu')){
    // Open new menu
    $('.menu').remove();
    $menuPlaceholder.html(_menu(whichMenu));
    setTimeout(function(){
      $menuPlaceholder.find('.menu').addClass('menu--active');
    }, 1);

  }
  else {
    // Remove menus when clicking outside .menu
    if(!$trigger.closest('.menu').length){
      $('.menu').remove();
    }
  }
}

function _menu(whichMenu){
  return '<div class="menu">\
        <ul>\
          <li data-overlay="'+whichMenu+'"><a href="javascript:;" title="Edit" class="material-icons button">edit</a> Edit</li>\
          <li data-overlay="remove"><a href="javascript:;" title="Remove" class="material-icons button">delete</a> Remove</li>\
        </ul>\
      </div>';
}

// Templates
function _item(itemTitle, itemDef, itemId) {
  return '<tr class="item" id="' + itemId + '">\
      <td class="item__description" colspan="2">' + itemTitle + '</td>\
      <td class="item__clipboard-copy">\
        <a href="javascript:;" title="Copy to Clipboard" class="material-icons button zclip" data-zclip-text="'+stripDoubleQuotes(itemDef)+'">content_copy</a>\
      </td>\
      <td class="item__definition">' + linkify(itemDef) + '</td>\
      <td class="item__actions">\
        <a href="javascript:;" title="Reorder" class="material-icons button js-sort-item-handle cursor-handle">sort</a>\
        <a href="javascript:;" class="material-icons button js--open-item-menu" data-menu="item">more_vert</a>\
        <div class="pos-rel js--menu-placeholder"></div>\
      </td>\
    </tr>';
}

function _category(categoryTitle, categoryId, categoryItems) {
  return '<table data-id="' + categoryId + '">\
      <thead>\
        <tr>\
          <td width="36px"></td>\
          <td width="25%"></td>\
          <td width="36px"></td>\
          <td width="100%"></td>\
          <td width="88px"></td>\
        </tr>\
        <tr>\
          <td width="36"><a href="javascript:;" class="button material-icons" data-overlay="item">add</a>\</td>\
          <td colspan="3">\
            <strong>' + categoryTitle + '</strong>\
          </td>\
          <td class="item__actions" width="72">\
            <a href="javascript:;" title="Reorder" class="material-icons button js-sort-category-handle cursor-handle">sort</a>\
            <a href="javascript:;" class="material-icons button js--open-item-menu" data-menu="category">more_vert</a>\
            <div class="pos-rel js--menu-placeholder"></div>\
          </td>\
        </tr>\
      </thead>\
      <tbody>' + categoryItems + '</tbody>\
    </table>';
}

// Init
$(function () {
  app.init();

  doSearch();
  doSortable();

  // Events
  $('body').on('click', '[data-overlay]', toggleOverlay);
  $('body').on('keydown', keyEvents);
  $('body').on('click', toggleItemMenu);
  $('#category-form').on('submit', submitCategory);
  $('#item-form').on('submit', submitItem);
  $('#remove-form').on('submit', submitRemove);

  // ZeroClipboard https://github.com/zeroclipboard/jquery.zeroclipboard
  $('body').on(copyEvents, '.zclip');
});
