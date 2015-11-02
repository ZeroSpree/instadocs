function _menu(whichMenu){
  return '<div class="menu">\
      <ul>\
        <li data-overlay="'+whichMenu+'"><a href="javascript:;" class="material-icons button">edit</a> Edit</li>\
        <li data-overlay="remove"><a href="javascript:;" class="material-icons button">delete</a> Remove</li>\
      </ul>\
    </div>';
}

function _item(itemTitle, itemDef, itemId) {
  return '<tr class="item" id="' + itemId + '">\
      <td class="item__description" colspan="2">' + itemTitle + '</td>\
      <td class="item__clipboard-copy">\
        <a href="javascript:;" title="Copy to Clipboard" class="material-icons button zclip" data-zclip-text="'+stripDoubleQuotes(itemDef)+'">content_copy</a>\
      </td>\
      <td class="item__definition">' + linkify(itemDef) + '</td>\
      <td class="item__actions">\
        <a href="javascript:;" class="material-icons button js-sort-item-handle cursor-handle mobile-hidden">sort</a>\
        <a href="javascript:;" class="material-icons button js--open-item-menu" data-menu="item">more_vert</a>\
        <div class="pos-rel js--menu-placeholder"></div>\
      </td>\
    </tr>';
}

function _category(categoryTitle, categoryId, categoryItems) {
  return '<table data-id="' + categoryId + '">\
      <thead>\
        <tr>\
          <td class="dummy-single-action"></td>\
          <td class="dummy-item"></td>\
          <td class="dummy-single-action"></td>\
          <td class="dummy-definition"></td>\
          <td class="dummy-actions"></td>\
        </tr>\
        <tr>\
          <td width="36"><a href="javascript:;" class="button material-icons" data-overlay="item">add</a>\</td>\
          <td colspan="3">\
            <strong>' + categoryTitle + '</strong>\
          </td>\
          <td class="item__actions" width="72">\
            <a href="javascript:;" class="material-icons button js-sort-category-handle cursor-handle mobile-hidden">sort</a>\
            <a href="javascript:;" class="material-icons button js--open-item-menu" data-menu="category">more_vert</a>\
            <div class="pos-rel js--menu-placeholder"></div>\
          </td>\
        </tr>\
      </thead>\
      <tbody>' + categoryItems + '</tbody>\
    </table>';
}