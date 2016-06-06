/* todo.js
 * by Arielle Chapin
 * Requirements: <String>.hashCode() from utils.js
 */

var TodoItem = function(text, prev) {
    this.text = text;
    this.checked = -1;
    this.prev = prev || null;
    this.next = null;
    this.id;
}

TodoItem.prototype.uncheck = function() {
    this.checked = -1;
}

var Todo = function(arg) {
    this.maxSize = undefined;
    this.size = 0;
    this.head = null;
    this.tail = null;
    this.items = {};

    // If a previous Todo has been passed, use it; else check for maxSize
    if (isNaN(arg) && this.items) {
        for (var key in arg) this[key] = arg[key];
    } else if (!isNaN(arg)) {
        this.maxSize = arg;
    }
}

Todo.prototype.updateEnds = function() {
    this.tail = this.items[this.tail.id];
    this.head = this.items[this.head.id];
}

Todo.prototype.addTodo = function(text) {
    if (this.maxSize && this.size == this.maxSize)
        return null;

    var item = new TodoItem(text, this.tail);
    this.hashItem(item);

    if (this.tail) {
        this.tail.next = item.id;
        item.prev = this.tail.id;
    }

    this.tail = item;

    if (!this.head) {
        this.head = item;
    }

    this.size++;
    this.updateEnds();

    return item;
}

Todo.prototype.removeTodo = function(item) {
    if (item.prev) {
        this.items[item.prev].next = item.next;
    }

    if (item.next) {
        this.items[item.next].prev = item.prev;
    }

    if (item.id === this.head.id) {
        this.head = this.items[item.next];
    }

    if (item.id === this.tail.id) {
        this.tail = this.items[item.prev];
    }
}

Todo.prototype.removeItemFromId = function(id) {
    if (this.size == 0)
        return false;

    var item = this.items[id];

    if (!item)
        return false;

    this.removeTodo(item);
    delete this.items[id];

    this.size--;
    
    if (this.size > 0)
        this.updateEnds();

    return true;
}

Todo.prototype.hashItem = function(item) {
    var id = item.text.hashCode();

    while (this.items[id]) {
        id++;
    }

    item.id = id;
    this.items[id] = item;
}

Todo.prototype.item = function(id) {
    return this.items[id];
}

Todo.prototype.itemChecked = function(id) {
    return this.items[id].checked != -1;
}

// range must be millis
Todo.prototype.itemCheckedOverRange = function(item, range) {
    var checked = item.checked;
    if (checked > -1)
        return (new Date().getTime() - checked) > range;
    else
        return false;
}

Todo.prototype.checkItem = function(id) {
    this.items[id].checked = new Date().getTime();
    if (id == this.head.id || id == this.tail.id)
        this.updateEnds();
}

Todo.prototype.uncheckItem = function(id) {
    this.items[id].checked = -1;
    if (id == this.head.id || id == this.tail.id)
        this.updateEnds();
}