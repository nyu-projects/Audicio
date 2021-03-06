﻿/// <reference path='jquery.js' />
/// <reference path='common.js' />
var FileItems = {
    _fileItems: [],
    get items() {
        return this._fileItems;
    },
    set items(i) {
        if (i instanceof Item) {
            this._fileItems.push(i);
            this.update();
        } else throw new TypeError("Invalid object given");
    },
    remove: function (i) {
        this._fileItems.splice(this._fileItems.indexOf(i), 1);
        this.update();
    },
    update: function () {
        console.log(this.length);
        if (this.length == 0)
            $(".container.media .dropzone").removeClass('multi');
        else
            $(".container.media .dropzone").addClass('multi');
    },
    get length() { return this._fileItems.length; }
}

var Item = function (file, container) {
    var _name = file.name;
    var _elebar = null;
    var _request = null;
    var _uploading = false;

    this.file = file;
    this.ele = null;

    Object.defineProperties(this, {
        init: {
            value: function () {
                var sName = document.createElement('span'),
                    sProgress = document.createElement('span'),
                    bCancel = document.createElement('button'),
                    dItem = document.createElement('div'),
                    self = this;

                sName.className = "name";
                sName.innerHTML = _name;

                _elebar = document.createElement('span');
                _elebar.className = "bar";

                sProgress.className = "progress";
                sProgress.appendChild(_elebar);

                bCancel.onclick = function () { self.abort.call(self) };

                dItem.classList.add("item");
                dItem.classList.add(file.type.split("/")[0]);
                dItem.appendChild(sProgress);
                dItem.appendChild(sName);
                dItem.appendChild(bCancel);

                self.ele = dItem;
                self.add();
            }
        },
        add: {
            value: function () {
                var container = document.getElementById("file-list");
                if (container && container.appendChild)
                    container.appendChild(this.ele);
            }
        },
        name: {
            get: function () { return _name; }
        },
        progress: {
            set: function (v) {
                var p = parseFloat(v), self = this;
                _elebar.style.width = p + "%";
                if (p >= 100) setTimeout(function () {
                    self.remove.call(self);
                }, 1000);
            }
        },
        request: {
            get: function () { return _request; },
            set: function (v) { _request = v; }
        },
        abort: {
            value: function () {
                if (_request && _request.abort) _request.abort();
                this.remove();
            }
        },
        remove: {
            value: function () {
                $(this.ele).remove();
                FileItems.remove(this);
            }
        },
        uploading: {
            get: function () { return _uploading; },
            set: function (v) { _uploading = v; }
        }
    })

    this.init();
}

var fileDragOver = function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (e.type == "dragover") e.target.classList.add("on");
    else e.target.classList.remove("on");
}

var uploadItem = function (item) {    
    var f = item.file, size = f.size;
    var time = new Date().getTime();    
    var fname = time + "-" + a_user_id + "-" + f.name;
    uploadFile(f, fname, function (p) {
        item.progress = p;
    })    
}

var fileSelection = function (e) {
    fileDragOver(e);
    var files = e.target.files || e.dataTransfer.files;
    if (files) {
        for (i in files) {
            if (typeof (f = files[i]) == "object") {
                var type = f.type.split("/")[0];
                if (type != "video" && type != "image") { console.log(type); continue; };
                FileItems.items = new Item(f);
            }
        }
        for (i in FileItems.items) {
            if (!FileItems.items[i].uploading) {
                FileItems.items[i].uploading = true;
                uploadItem(FileItems.items[i]);
            }
        }
        $(".container.media .dropzone .upload input.file").val("");
    }
}

window.Media = {};
window.Media.init = function () {
    console.log('Init media');
    var filedrop = $(".container.media .dropzone"),
        fileselect = $(".upload input.file", filedrop);

    if (filedrop.length == 0) {
        console.log('No valid media found');
        fileselect.unbind();
        filedrop.unbind();
        window.onbeforeunload = null;
    } else {
        console.log("In Media");

        fileselect = fileselect[0];
        filedrop = filedrop[0];

        if (FileItems.length > 0) {
            FileItems.update();
            for (i in FileItems.items) {
                FileItems.items[i].add();
            }
        }

        fileselect.addEventListener('change', fileSelection, false);

        filedrop.addEventListener('dragover', fileDragOver, false);
        filedrop.addEventListener('dragleave', fileDragOver, false);
        filedrop.addEventListener('drop', fileSelection, false);

        window.onbeforeunload = function () {
            if (FileItems.length > 0) {
                return "Your files are still uploading ...";
            }
        }
    }
}