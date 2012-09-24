(function() {

  window.MorpherJS = {};

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  MorpherJS.EventDispatcher = (function() {

    function EventDispatcher() {
      this.trigger = __bind(this.trigger, this);

      this.off = __bind(this.off, this);

      this.on = __bind(this.on, this);

    }

    EventDispatcher.prototype.on = function(events, callback, context) {
      var calls, ev, list, tail;
      ev = null;
      events = events.split(/\s+/);
      calls = this._callbacks || (this._callbacks = {});
      while (ev = events.shift()) {
        list = calls[ev] || (calls[ev] = {});
        tail = list.tail || (list.tail = list.next = {});
        tail.callback = callback;
        tail.context = context;
        list.tail = tail.next = {};
      }
      return this;
    };

    EventDispatcher.prototype.off = function(events, callback, context) {
      var calls, ev, node;
      ev = calls = node = null;
      if (!events) {
        delete this._callbacks;
      } else if (calls = this._callbacks) {
        events = events.split(/\s+/);
        while (ev = events.shift()) {
          node = calls[ev];
          delete calls[ev];
          if (!callback || !node) {
            continue;
          }
          while ((node = node.next) && node.next) {
            if (node.callback === callback && (!context || node.context === context)) {
              continue;
            }
            this.bind(ev, node.callback, node.context);
          }
        }
      }
      return this;
    };

    EventDispatcher.prototype.trigger = function(events) {
      var all, args, calls, event, node, rest, tail;
      event = node = calls = tail = args = all = rest = null;
      if (!(calls = this._callbacks)) {
        return this;
      }
      all = calls['all'];
      (events = events.split(/\s+/)).push(null);
      while (event = events.shift()) {
        if (all) {
          events.push({
            next: all.next,
            tail: all.tail,
            event: event
          });
        }
        if (!(node = calls[event])) {
          continue;
        }
        events.push({
          next: node.next,
          tail: node.tail
        });
      }
      rest = Array.prototype.slice.call(arguments, 1);
      while (node = events.pop()) {
        tail = node.tail;
        args = node.event ? [node.event].concat(rest) : rest;
        while ((node = node.next) !== tail) {
          node.callback.apply(node.context || this, args);
        }
      }
      return this;
    };

    return EventDispatcher;

  })();

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  MorpherJS.Matrix = (function() {

    Matrix.prototype.values = false;

    Matrix.prototype.transforms = false;

    function Matrix() {
      this.multiplyWith = __bind(this.multiplyWith, this);

      this.toTransform = __bind(this.toTransform, this);

      this.toCSS = __bind(this.toCSS, this);

      this.apply = __bind(this.apply, this);

      this.removeTransform = __bind(this.removeTransform, this);

      this.shear = __bind(this.shear, this);

      this.rotate = __bind(this.rotate, this);

      this.skew = __bind(this.skew, this);

      this.scale = __bind(this.scale, this);

      this.translate = __bind(this.translate, this);

      this.set = __bind(this.set, this);

      this.get = __bind(this.get, this);

      var i, val;
      this.values = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      for (i in arguments) {
        val = arguments[i];
        this.values[i] = val;
      }
      this.transforms = [];
    }

    Matrix.prototype.get = function(i, j) {
      return this.values[i * 3 + j];
    };

    Matrix.prototype.set = function(i, j, value) {
      return this.values[i * 3 + j] = value;
    };

    Matrix.prototype.translate = function(tx, ty) {
      if (tx == null) {
        tx = 0;
      }
      if (ty == null) {
        ty = 0;
      }
      return this.transforms.unshift(new MorpherJS.Matrix(1, 0, tx, 0, 1, ty, 0, 0, 1));
    };

    Matrix.prototype.scale = function(sx, sy) {
      if (sx == null) {
        sx = 1;
      }
      if (sy == null) {
        sy = 1;
      }
      return this.transforms.unshift(new MorpherJS.Matrix(sx, 0, 0, 0, sy, 0, 0, 0, 1));
    };

    Matrix.prototype.skew = function(sx, sy) {
      if (sx == null) {
        sx = 0;
      }
      if (sy == null) {
        sy = 0;
      }
      return this.transforms.unshift(new MorpherJS.Matrix(1, Math.tan(sx), 0, Math.tan(sy), 1, 0, 0, 0, 1));
    };

    Matrix.prototype.rotate = function(a) {
      return this.transforms.unshift(new MorpherJS.Matrix(Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1));
    };

    Matrix.prototype.shear = function(sx, sy) {
      if (sx == null) {
        sx = 0;
      }
      if (sy == null) {
        sy = 0;
      }
      return this.transforms.unshift(new MorpherJS.Matrix(1, sx, 0, sy, 1, 0, 0, 0, 1));
    };

    Matrix.prototype.removeTransform = function(i) {
      return this.transforms.splice(this.transforms.length - 1 - i, 1);
    };

    Matrix.prototype.apply = function(onSelf) {
      var matr, transform, _i, _len, _ref;
      if (onSelf == null) {
        onSelf = false;
      }
      matr = onSelf ? this : new MorpherJS.Matrix();
      _ref = this.transforms;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        transform = _ref[_i];
        matr.multiplyWith(transform, true);
      }
      return matr;
    };

    Matrix.prototype.toCSS = function() {
      return "matrix(" + (this.toTransform().join(', ')) + ")";
    };

    Matrix.prototype.toTransform = function() {
      return [this.get(0, 0), this.get(1, 0), this.get(0, 1), this.get(1, 1), this.get(0, 2), this.get(1, 2)];
    };

    Matrix.prototype.multiplyWith = function(matrix, dontApply) {
      var i, j, k, sum, values, _i, _j, _k;
      if (dontApply == null) {
        dontApply = false;
      }
      if (!dontApply) {
        this.apply(true);
      }
      values = [];
      for (i = _i = 0; _i <= 2; i = ++_i) {
        for (j = _j = 0; _j <= 2; j = ++_j) {
          sum = 0;
          for (k = _k = 0; _k <= 2; k = ++_k) {
            sum += this.get(i, k) * matrix.get(k, j);
          }
          values.push(sum);
        }
      }
      this.values = values;
      return this;
    };

    return Matrix;

  })();

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MorpherJS.DraggableDot = (function(_super) {

    __extends(DraggableDot, _super);

    DraggableDot.prototype.el = null;

    DraggableDot.prototype.x = 0;

    DraggableDot.prototype.y = 0;

    DraggableDot.prototype.delta = null;

    function DraggableDot() {
      this.mouseHandler = __bind(this.mouseHandler, this);

      this.update = __bind(this.update, this);

      this.remove = __bind(this.remove, this);

      this.moveTo = __bind(this.moveTo, this);
      this.delta = {
        x: 0,
        y: 0
      };
      this.el = $('<div />').addClass('dot').bind('mousedown', this.mouseHandler);
    }

    DraggableDot.prototype.moveTo = function(x, y) {
      this.x = x;
      this.y = y;
      return this.update();
    };

    DraggableDot.prototype.remove = function() {
      return this.el.remove();
    };

    DraggableDot.prototype.update = function() {
      return this.el.css({
        left: this.x,
        top: this.y
      });
    };

    DraggableDot.prototype.mouseHandler = function(e) {
      e.preventDefault();
      if (e.ctrlKey) {
        if (this.el.is('.selected')) {
          this.el.removeClass('selected');
          return this.trigger('deselect', this);
        } else {
          this.el.addClass('selected');
          return this.trigger('select', this);
        }
      } else {
        switch (e.type) {
          case 'mousedown':
            this.delta.x = e.pageX - this.el.position().left;
            this.delta.y = e.pageY - this.el.position().top;
            return $(window).bind('mousemove mouseup', this.mouseHandler);
          case 'mousemove':
            this.moveTo(e.pageX - this.delta.x, e.pageY - this.delta.y);
            return this.trigger('change', this);
          case 'mouseup':
            return $(window).unbind('mousemove mouseup', this.mouseHandler);
        }
      }
    };

    return DraggableDot;

  })(Backbone.Model);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  MorpherJS.Image = (function(_super) {

    __extends(Image, _super);

    Image.prototype.el = null;

    Image.prototype.source = null;

    Image.prototype.mesh = null;

    Image.prototype.weight = 0;

    function Image(json) {
      if (json == null) {
        json = {};
      }
      this.fromJSON = __bind(this.fromJSON, this);

      this.toJSON = __bind(this.toJSON, this);

      this.refreshSource = __bind(this.refreshSource, this);

      this.draw = __bind(this.draw, this);

      this.propagateMeshEvent = __bind(this.propagateMeshEvent, this);

      this.removeTriangle = __bind(this.removeTriangle, this);

      this.addTriangle = __bind(this.addTriangle, this);

      this.splitEdge = __bind(this.splitEdge, this);

      this.getRelativePositionOf = __bind(this.getRelativePositionOf, this);

      this.makeCompatibleWith = __bind(this.makeCompatibleWith, this);

      this.removePoint = __bind(this.removePoint, this);

      this.addPoint = __bind(this.addPoint, this);

      this.setMaxSize = __bind(this.setMaxSize, this);

      this.loadHandler = __bind(this.loadHandler, this);

      this.getWeight = __bind(this.getWeight, this);

      this.setWeight = __bind(this.setWeight, this);

      this.setSrc = __bind(this.setSrc, this);

      this.el = new window.Image();
      this.el.onload = this.loadHandler;
      this.source = document.createElement('canvas');
      this.mesh = new MorpherJS.Mesh();
      this.mesh.on('all', this.propagateMeshEvent);
      this.mesh.on('change:bounds', this.refreshSource);
      this.triangles = this.mesh.triangles;
      this.points = this.mesh.points;
      this.fromJSON(json);
    }

    Image.prototype.setSrc = function(src) {
      return this.el.src = src;
    };

    Image.prototype.setWeight = function(w, params) {
      if (params == null) {
        params = {};
      }
      this.weight = w * 1;
      if (!params.silent) {
        return this.trigger('change:weight change');
      }
    };

    Image.prototype.getWeight = function() {
      return this.weight;
    };

    Image.prototype.loadHandler = function() {
      this.refreshSource();
      return this.trigger('load', this, this.el);
    };

    Image.prototype.setMaxSize = function() {
      return this.mesh.setMaxSize.apply(this, arguments);
    };

    Image.prototype.addPoint = function() {
      return this.mesh.addPoint.apply(this, arguments);
    };

    Image.prototype.removePoint = function() {
      return this.mesh.removePoint.apply(this, arguments);
    };

    Image.prototype.makeCompatibleWith = function() {
      return this.mesh.makeCompatibleWith.apply(this, arguments);
    };

    Image.prototype.getRelativePositionOf = function() {
      return this.mesh.getRelativePositionOf.apply(this, arguments);
    };

    Image.prototype.splitEdge = function() {
      return this.mesh.splitEdge.apply(this, arguments);
    };

    Image.prototype.addTriangle = function() {
      return this.mesh.addTriangle.apply(this, arguments);
    };

    Image.prototype.removeTriangle = function() {
      return this.mesh.removeTriangle.apply(this, arguments);
    };

    Image.prototype.propagateMeshEvent = function() {
      var args, target, type;
      type = arguments[0], target = arguments[1], args = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
      return this.trigger.apply(this, [type, this].concat(args));
    };

    Image.prototype.draw = function(ctx, mesh) {
      var i, triangle, _i, _len, _ref, _results;
      _ref = this.triangles;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        triangle = _ref[i];
        _results.push(triangle.draw(this.source, ctx, mesh.triangles[i]));
      }
      return _results;
    };

    Image.prototype.refreshSource = function() {
      var ctx;
      this.source.width = this.mesh.bounds.width;
      this.source.height = this.mesh.bounds.height;
      ctx = this.source.getContext('2d');
      return ctx.drawImage(this.el, 0, 0);
    };

    Image.prototype.toJSON = function() {
      var json;
      json = this.mesh.toJSON();
      json.src = this.el.src;
      return json;
    };

    Image.prototype.fromJSON = function(json, params) {
      if (json == null) {
        json = {};
      }
      if (params == null) {
        params = {};
      }
      this.mesh.fromJSON(json, params);
      if (json.src != null) {
        return this.el.src = json.src;
      }
    };

    return Image;

  })(MorpherJS.EventDispatcher);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MorpherJS.Mesh = (function(_super) {

    __extends(Mesh, _super);

    Mesh.prototype.points = null;

    Mesh.prototype.triangles = null;

    Mesh.prototype.bounds = {
      width: 0,
      height: 0
    };

    Mesh.prototype.maxWidth = 0;

    Mesh.prototype.maxHeight = 0;

    function Mesh(params) {
      if (params == null) {
        params = {};
      }
      this.reset = __bind(this.reset, this);

      this.fromJSON = __bind(this.fromJSON, this);

      this.toJSON = __bind(this.toJSON, this);

      this.removeTriangle = __bind(this.removeTriangle, this);

      this.addTriangle = __bind(this.addTriangle, this);

      this.splitEdge = __bind(this.splitEdge, this);

      this.findNearestPointOfLine = __bind(this.findNearestPointOfLine, this);

      this.findLine = __bind(this.findLine, this);

      this.resolveRelativePosition = __bind(this.resolveRelativePosition, this);

      this.getRelativePositionOf = __bind(this.getRelativePositionOf, this);

      this.changeHandler = __bind(this.changeHandler, this);

      this.makeCompatibleWith = __bind(this.makeCompatibleWith, this);

      this.removePoint = __bind(this.removePoint, this);

      this.addPoint = __bind(this.addPoint, this);

      this.refreshBounds = __bind(this.refreshBounds, this);

      this.setMaxSize = __bind(this.setMaxSize, this);

      this.points = [];
      this.triangles = [];
    }

    Mesh.prototype.setMaxSize = function(w, h) {
      this.maxWidth = w;
      return this.maxHeight = h;
    };

    Mesh.prototype.refreshBounds = function(params) {
      var bounds, point, _i, _len, _ref;
      if (params == null) {
        params = {};
      }
      bounds = {
        width: 0,
        height: 0
      };
      _ref = this.points;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        bounds.width = Math.max(bounds.width, point.x);
        bounds.height = Math.max(bounds.height, point.y);
      }
      if (bounds.width !== this.bounds.width || bounds.height !== this.bounds.height) {
        this.bounds = bounds;
        if (!params.silent) {
          return this.trigger('change:bounds');
        }
      }
    };

    Mesh.prototype.addPoint = function(pointParams, params) {
      var point, position;
      if (params == null) {
        params = {};
      }
      if (!(pointParams instanceof MorpherJS.Point)) {
        if (pointParams.points != null) {
          position = this.resolveRelativePosition(pointParams);
        } else {
          position = pointParams;
          pointParams = null;
        }
        point = new MorpherJS.Point(position.x, position.y, {
          mesh: this
        });
      } else {
        point = pointParams;
        point.mesh = this;
        pointParams = null;
      }
      point.on("change", this.changeHandler);
      point.on('remove', this.removePoint);
      this.points.push(point);
      this.refreshBounds(params);
      if (!params.silent) {
        this.trigger('point:add', this, point, pointParams);
      }
      return point;
    };

    Mesh.prototype.removePoint = function(point, params) {
      var i;
      if (params == null) {
        params = {};
      }
      if (point instanceof MorpherJS.Point) {
        i = this.points.indexOf(point);
      } else {
        i = point;
      }
      if ((i != null) && i !== -1) {
        delete this.points.splice(i, 1);
        if (!params.silent) {
          return this.trigger('point:remove', this, point, i);
        }
      }
    };

    Mesh.prototype.makeCompatibleWith = function(mesh) {
      var point, _i, _len, _ref, _results;
      if (mesh instanceof MorpherJS.Image) {
        mesh = mesh.mesh;
      }
      if (this.points.length !== mesh.points.length) {
        if (this.points.length > mesh.points.length) {
          return this.points.splice(mesh.points.length, this.points.length - mesh.points.length);
        } else {
          _ref = mesh.points.slice(this.points.length, mesh.points.length + 1 || 9e9);
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            point = _ref[_i];
            _results.push(this.addPoint({
              x: point.x,
              y: point.y
            }));
          }
          return _results;
        }
      }
    };

    Mesh.prototype.changeHandler = function() {
      this.refreshBounds();
      return this.trigger('change');
    };

    Mesh.prototype.getRelativePositionOf = function(point) {
      var a, a2, b, b2, baseD, d, dX, dY, directionX, directionY, i, iX, iY, intersection, n, nearest, obj, p, x, y, _i, _j, _len, _len1, _ref, _ref1, _ref2;
      nearest = [];
      _ref = this.points;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        if (p !== point) {
          d = p.distanceTo(point);
          if (nearest.length === 0) {
            nearest.push({
              distance: d,
              point: p
            });
          } else {
            for (i = _j = 0, _len1 = nearest.length; _j < _len1; i = ++_j) {
              n = nearest[i];
              if (d < n.distance || (i === nearest.length - 1 && nearest.length < 3)) {
                obj = {
                  distance: d,
                  point: p
                };
                if (nearest.length >= 3) {
                  nearest.splice(i, 1, obj);
                } else if (d < n.distance) {
                  nearest.splice(i, 0, obj);
                } else {
                  nearest.splice(i + 1, 0, obj);
                }
                break;
              }
            }
          }
        }
      }
      x = y = 0;
      switch (nearest.length) {
        case 0:
          x = point.x;
          y = point.y;
          break;
        case 1:
          x = point.x - nearest[0].point.x;
          y = point.y - nearest[0].point.y;
          break;
        case 2:
        case 3:
          _ref1 = this.findLine(nearest[0].point, nearest[1].point), a = _ref1[0], b = _ref1[1];
          if (nearest.length === 2) {
            intersection = this.findNearestPointOfLine(a, b, point);
          } else {
            _ref2 = this.findLine(point, nearest[2].point), a2 = _ref2[0], b2 = _ref2[1];
            iX = (b2 - b) / (a - a2);
            iY = a * iX + b;
            intersection = new MorpherJS.Point(iX, iY);
          }
          baseD = nearest[0].point.distanceTo(nearest[1].point);
          directionX = (intersection.x - nearest[0].point.x) * (nearest[1].point.x - nearest[0].point.x) > 0 ? 1 : -1;
          dX = nearest[0].point.distanceTo(intersection);
          x = dX * directionX / baseD;
          dY = point.distanceTo(intersection);
          if (nearest.length === 2) {
            directionY = (point.y - intersection.y) * (nearest[1].point.x - nearest[0].point.x) < 0 ? 1 : -1;
          } else {
            baseD = nearest[2].point.distanceTo(intersection);
            directionY = (point.x - intersection.x) * (nearest[2].point.x - intersection.x) > 0 ? 1 : -1;
          }
          y = dY * directionY / baseD;
      }
      nearest = (function() {
        var _k, _len2, _results;
        _results = [];
        for (_k = 0, _len2 = nearest.length; _k < _len2; _k++) {
          n = nearest[_k];
          _results.push(this.points.indexOf(n.point));
        }
        return _results;
      }).call(this);
      return {
        points: nearest,
        x: x,
        y: y
      };
    };

    Mesh.prototype.resolveRelativePosition = function(position) {
      var dX, dY, iX, iY, intersection, point, point1, point2, point3, x, y;
      switch (position.points.length) {
        case 0:
          x = position.x;
          y = position.y;
          break;
        case 1:
          point = this.points[position.points[0]];
          x = point.x + position.x;
          y = point.y + position.y;
          break;
        case 2:
        case 3:
          point1 = this.points[position.points[0]];
          point2 = this.points[position.points[1]];
          iX = (point2.x - point1.x) * position.x + point1.x;
          iY = (point2.y - point1.y) * position.x + point1.y;
          intersection = new MorpherJS.Point(iX, iY);
          if (position.points.length === 2) {
            dX = (point2.y - point1.y) * position.y;
            dY = -(point2.x - point1.x) * position.y;
          } else {
            point3 = this.points[position.points[2]];
            dX = (point3.x - intersection.x) * position.y;
            dY = (point3.y - intersection.y) * position.y;
          }
          x = intersection.x + dX;
          y = intersection.y + dY;
      }
      return {
        x: x,
        y: y
      };
    };

    Mesh.prototype.findLine = function(p1, p2) {
      var a, b;
      if (p1.x - p2.x) {
        a = (p1.y - p2.y) / (p1.x - p2.x);
        b = p1.y - a * p1.x;
        return [a, b];
      } else {
        return [null, p1.x];
      }
    };

    Mesh.prototype.findNearestPointOfLine = function(a, b, p) {
      var normalA, normalB, x, y;
      if (a != null) {
        normalA = -1 / a;
        normalB = p.y - normalA * p.x;
        x = (normalB - b) / (a - normalA);
        y = a * x + b;
      } else {
        x = b;
        y = p.y;
      }
      return new MorpherJS.Point(x, y);
    };

    Mesh.prototype.splitEdge = function(p1, p2) {
      var i, i1, i2, i3, i4, p3, p4, point, triangle, _i, _len, _ref, _results;
      i1 = this.points.indexOf(p1);
      i2 = this.points.indexOf(p2);
      p4 = this.addPoint({
        points: [i1, i2],
        x: 0.5,
        y: 0
      });
      i4 = this.points.indexOf(p4);
      i = 0;
      _results = [];
      while (i < this.triangles.length) {
        triangle = this.triangles[i];
        if (triangle.hasPoint(p1) && triangle.hasPoint(p2)) {
          _ref = [triangle.p1, triangle.p2, triangle.p3];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            point = _ref[_i];
            if (point !== p1 && point !== p2) {
              p3 = point;
            }
          }
          i3 = this.points.indexOf(p3);
          triangle.remove();
          this.addTriangle(i1, i3, i4);
          _results.push(this.addTriangle(i2, i3, i4));
        } else {
          _results.push(i++);
        }
      }
      return _results;
    };

    Mesh.prototype.addTriangle = function(p1, p2, p3) {
      var triangle;
      if (!(this.points[p1] && this.points[p2] && this.points[p3])) {
        return;
      }
      triangle = new MorpherJS.Triangle(this.points[p1], this.points[p2], this.points[p3]);
      triangle.on('remove', this.removeTriangle);
      this.triangles.push(triangle);
      return this.trigger('triangle:add', this, p1, p2, p3, triangle);
    };

    Mesh.prototype.removeTriangle = function(triangle, params) {
      var i;
      if (params == null) {
        params = {};
      }
      if (triangle instanceof MorpherJS.Triangle) {
        i = this.triangles.indexOf(triangle);
      } else {
        i = triangle;
        triangle = this.triangles[i];
      }
      if ((i != null) && i !== -1) {
        delete this.triangles.splice(i, 1);
        triangle.off('remove', this.removeTriangle);
        triangle.remove();
        if (!params.silent) {
          return this.trigger('triangle:remove', this, triangle, i);
        }
      }
    };

    Mesh.prototype.toJSON = function() {
      var json, point, _i, _len, _ref;
      json = {};
      json.points = [];
      _ref = this.points;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        json.points.push(point.toJSON());
      }
      return json;
    };

    Mesh.prototype.fromJSON = function(json, params) {
      var i, point, _i, _len, _ref, _results;
      if (json == null) {
        json = {};
      }
      if (params == null) {
        params = {};
      }
      if (params.hard) {
        this.reset();
      }
      if (json.points != null) {
        _ref = json.points;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          point = _ref[i];
          if (i > this.points.length - 1) {
            _results.push(this.addPoint(point, params));
          } else {
            _results.push(this.points[i].fromJSON(point, params));
          }
        }
        return _results;
      }
    };

    Mesh.prototype.reset = function() {
      var point, _i, _len, _ref, _results;
      _ref = this.points;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        point = _ref[_i];
        _results.push(this.removePoint(point));
      }
      return _results;
    };

    return Mesh;

  })(MorpherJS.EventDispatcher);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MorpherJS.Morpher = (function(_super) {

    __extends(Morpher, _super);

    Morpher.prototype.images = null;

    Morpher.prototype.triangles = [];

    Morpher.prototype.mesh = null;

    Morpher.prototype.totalWeight = 0;

    Morpher.prototype.canvas = null;

    Morpher.prototype.ctx = null;

    Morpher.prototype.tmpCanvas = null;

    Morpher.prototype.tmpCtx = null;

    Morpher.prototype.blendFunction = null;

    Morpher.prototype.finalTouchFunction = null;

    Morpher.prototype.easingFunction = null;

    Morpher.prototype.requestID = null;

    Morpher.prototype.t0 = null;

    Morpher.prototype.duration = null;

    Morpher.prototype.state0 = null;

    Morpher.prototype.state1 = null;

    function Morpher(params) {
      if (params == null) {
        params = {};
      }
      this.reset = __bind(this.reset, this);

      this.fromJSON = __bind(this.fromJSON, this);

      this.toJSON = __bind(this.toJSON, this);

      this.animationStep = __bind(this.animationStep, this);

      this.updateMesh = __bind(this.updateMesh, this);

      this.refreshMaxSize = __bind(this.refreshMaxSize, this);

      this.updateCanvasSize = __bind(this.updateCanvasSize, this);

      this.drawNow = __bind(this.drawNow, this);

      this.draw = __bind(this.draw, this);

      this.removeTriangleHandler = __bind(this.removeTriangleHandler, this);

      this.addTriangleHandler = __bind(this.addTriangleHandler, this);

      this.triangleExists = __bind(this.triangleExists, this);

      this.addTriangle = __bind(this.addTriangle, this);

      this.removePointHandler = __bind(this.removePointHandler, this);

      this.addPointHandler = __bind(this.addPointHandler, this);

      this.addPoint = __bind(this.addPoint, this);

      this.changeHandler = __bind(this.changeHandler, this);

      this.loadHandler = __bind(this.loadHandler, this);

      this.removeImage = __bind(this.removeImage, this);

      this.addImage = __bind(this.addImage, this);

      this.animate = __bind(this.animate, this);

      this.set = __bind(this.set, this);

      this.images = [];
      this.triangles = [];
      this.mesh = new MorpherJS.Mesh();
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.tmpCanvas = document.createElement('canvas');
      this.tmpCtx = this.tmpCanvas.getContext('2d');
      this.fromJSON(params);
      this.set([1]);
    }

    Morpher.prototype.set = function(weights, params) {
      var i, img, _i, _len, _ref, _results;
      if (params == null) {
        params = {};
      }
      _ref = this.images;
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        img = _ref[i];
        _results.push(img.setWeight(weights[i] || 0, params));
      }
      return _results;
    };

    Morpher.prototype.animate = function(weights, duration, easing) {
      var img, _i, _len, _ref;
      this.state0 = [];
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        img = _ref[_i];
        this.state0.push(img.getWeight());
      }
      this.state1 = weights;
      this.t0 = new Date().getTime();
      this.duration = duration;
      this.easingFunction = easing;
      return this.draw();
    };

    Morpher.prototype.addImage = function(image, params) {
      if (params == null) {
        params = {};
      }
      if (!(image instanceof MorpherJS.Image)) {
        image = new MorpherJS.Image(image);
      }
      if (this.images.length) {
        image.makeCompatibleWith(this.images[this.images.length - 1]);
      }
      this.images.push(image);
      image.on('load', this.loadHandler);
      image.on('change', this.changeHandler);
      image.on('point:add', this.addPointHandler);
      image.on('point:remove', this.removePointHandler);
      image.on('triangle:add', this.addTriangleHandler);
      image.on('triangle:remove', this.removeTriangleHandler);
      image.on('change', this.draw);
      this.loadHandler();
      if (!params.silent) {
        return this.trigger('image:add');
      }
    };

    Morpher.prototype.removeImage = function(image) {
      var i;
      i = this.images.indexOf(image);
      if (i !== -1) {
        delete this.images.splice(i, 1);
        return this.trigger('image:remove');
      }
    };

    Morpher.prototype.loadHandler = function(e) {
      var image, _i, _len, _ref;
      this.draw();
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        image = _ref[_i];
        if (!(image.el.width && image.el.height)) {
          return false;
        }
      }
      this.refreshMaxSize();
      return this.trigger('load', this, this.canvas);
    };

    Morpher.prototype.changeHandler = function(e) {
      return this.trigger('change');
    };

    Morpher.prototype.addPoint = function(x, y) {
      var image, _i, _len, _ref;
      _ref = this.images.concat(this.mesh);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        image = _ref[_i];
        image.addPoint({
          x: x,
          y: y
        });
      }
      return this.trigger('point:add', this);
    };

    Morpher.prototype.addPointHandler = function(image, point, pointParams) {
      var img, position, _i, _len, _ref;
      if (pointParams == null) {
        pointParams = null;
      }
      position = pointParams || image.getRelativePositionOf(point);
      _ref = this.images.concat(this.mesh);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        img = _ref[_i];
        if (img.points.length < image.points.length) {
          img.addPoint(position);
          return;
        }
      }
      return this.trigger('point:add', this);
    };

    Morpher.prototype.removePointHandler = function(image, point, index) {
      var img, k, triangle, v, _i, _j, _k, _len, _len1, _len2, _ref, _ref1;
      _ref = this.images.concat(this.mesh);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        img = _ref[_i];
        if (img.points.length > image.points.length) {
          img.removePoint(index);
          return;
        }
      }
      _ref1 = this.triangles;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        triangle = _ref1[_j];
        for (k = _k = 0, _len2 = triangle.length; _k < _len2; k = ++_k) {
          v = triangle[k];
          if (v >= index) {
            triangle[k] -= 1;
          }
        }
      }
      return this.trigger('point:remove', this);
    };

    Morpher.prototype.addTriangle = function(i1, i2, i3) {
      if (this.images.length > 0) {
        return this.images[0].addTriangle(i1, i2, i3);
      }
    };

    Morpher.prototype.triangleExists = function(i1, i2, i3) {
      var t, _i, _len, _ref;
      _ref = this.triangles;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        t = _ref[_i];
        if (t.indexOf(i1) !== -1 && t.indexOf(i2) !== -1 && t.indexOf(i3) !== -1) {
          return true;
        }
      }
      return false;
    };

    Morpher.prototype.addTriangleHandler = function(image, i1, i2, i3, triangle) {
      var img, _i, _len, _ref;
      if (image.triangles.length > this.triangles.length && !this.triangleExists(i1, i2, i3)) {
        this.triangles.push([i1, i2, i3]);
      }
      _ref = this.images.concat(this.mesh);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        img = _ref[_i];
        if (img.triangles.length < this.triangles.length) {
          img.addTriangle(i1, i2, i3);
          return;
        }
      }
      return this.trigger('triangle:add', this);
    };

    Morpher.prototype.removeTriangleHandler = function(image, triangle, index) {
      var img, _i, _len, _ref;
      if (image.triangles.length < this.triangles.length) {
        delete this.triangles.splice(index, 1);
      }
      _ref = this.images.concat(this.mesh);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        img = _ref[_i];
        if (img.triangles.length > this.triangles.length) {
          img.removeTriangle(index);
          return;
        }
      }
      return this.trigger('triangle:remove', this);
    };

    Morpher.prototype.draw = function() {
      var requestFrame;
      if (this.requestID != null) {
        return;
      }
      requestFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || window.webkitRequestAnimationFrame;
      if (requestFrame != null) {
        return this.requestID = requestFrame(this.drawNow);
      } else {
        return this.drawNow();
      }
    };

    Morpher.prototype.drawNow = function() {
      var blend, image, _i, _len, _ref;
      this.canvas.width = this.canvas.width;
      this.updateCanvasSize();
      this.animationStep();
      this.updateMesh();
      blend = this.blendFunction || MorpherJS.Morpher.defaultBlendFunction;
      if (this.canvas.width > 0 && this.canvas.height > 0 && this.totalWeight > 0) {
        _ref = this.images;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          image = _ref[_i];
          this.tmpCanvas.width = this.tmpCanvas.width;
          image.draw(this.tmpCtx, this.mesh);
          blend(this.canvas, this.tmpCanvas, image.weight);
        }
        if (this.finalTouchFunction != null) {
          this.finalTouchFunction(this.canvas);
        }
        this.trigger('draw', this, this.canvas);
      }
      this.requestID = null;
      if (this.t0 != null) {
        return this.draw();
      }
    };

    Morpher.prototype.updateCanvasSize = function() {
      var h, image, w, _i, _len, _ref;
      w = 0;
      h = 0;
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        image = _ref[_i];
        w = Math.max(image.el.width, w);
        h = Math.max(image.el.height, h);
      }
      if (w !== this.canvas.width || h !== this.canvas.height) {
        this.canvas.width = this.tmpCanvas.width = w;
        this.canvas.height = this.tmpCanvas.height = h;
        this.refreshMaxSize();
        return this.trigger('resize', this, this.canvas);
      }
    };

    Morpher.prototype.refreshMaxSize = function() {
      var img, _i, _len, _ref, _results;
      _ref = this.images;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        img = _ref[_i];
        _results.push(img.setMaxSize(this.canvas.width, this.canvas.height));
      }
      return _results;
    };

    Morpher.prototype.updateMesh = function() {
      var i, img, p, _i, _j, _len, _len1, _ref, _ref1, _results;
      this.totalWeight = 0;
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        img = _ref[_i];
        this.totalWeight += img.weight;
      }
      _ref1 = this.mesh.points;
      _results = [];
      for (i = _j = 0, _len1 = _ref1.length; _j < _len1; i = ++_j) {
        p = _ref1[i];
        p.x = p.y = 0;
        _results.push((function() {
          var _k, _len2, _ref2, _results1;
          _ref2 = this.images;
          _results1 = [];
          for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
            img = _ref2[_k];
            p.x += img.points[i].x * img.weight / this.totalWeight;
            _results1.push(p.y += img.points[i].y * img.weight / this.totalWeight);
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    Morpher.prototype.animationStep = function() {
      var i, progress, state, t, w, _i, _len, _ref;
      if (this.t0 != null) {
        t = new Date().getTime() - this.t0;
        if (t >= this.duration) {
          state = this.state1;
          this.state0 = this.state1 = this.t0 = null;
        } else {
          progress = t / this.duration;
          if (this.easingFunction != null) {
            progress = this.easingFunction(progress);
          }
          state = [];
          _ref = this.state0;
          for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
            w = _ref[i];
            state.push(w * (1 - progress) + this.state1[i] * progress);
          }
        }
        return this.set(state, {
          silent: true
        });
      }
    };

    Morpher.defaultBlendFunction = function(destination, source, weight) {
      var dData, i, sData, value, _i, _len, _ref;
      dData = destination.getContext('2d').getImageData(0, 0, source.width, source.height);
      sData = source.getContext('2d').getImageData(0, 0, source.width, source.height);
      _ref = sData.data;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        value = _ref[i];
        dData.data[i] += value * weight;
      }
      return destination.getContext('2d').putImageData(dData, 0, 0);
    };

    Morpher.prototype.toJSON = function() {
      var image, json, _i, _len, _ref;
      json = {};
      json.images = [];
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        image = _ref[_i];
        json.images.push(image.toJSON());
      }
      json.triangles = this.triangles.slice();
      return json;
    };

    Morpher.prototype.fromJSON = function(json, params) {
      var i, image, triangle, _i, _j, _len, _len1, _ref, _ref1, _results;
      if (json == null) {
        json = {};
      }
      if (params == null) {
        params = {};
      }
      if (params.hard) {
        this.reset();
      }
      if (json.blendFunction != null) {
        this.blendFunction = json.blendFunction;
      }
      if (json.images != null) {
        _ref = json.images;
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          image = _ref[i];
          if (i > this.images.length - 1) {
            this.addImage(image, params);
          } else {
            this.images[i].fromJSON(image, params);
          }
        }
        this.mesh.makeCompatibleWith(this.images[0]);
      }
      if (json.triangles != null) {
        _ref1 = json.triangles.slice(this.triangles.length);
        _results = [];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          triangle = _ref1[_j];
          _results.push(this.addTriangle(triangle[0], triangle[1], triangle[2]));
        }
        return _results;
      }
    };

    Morpher.prototype.reset = function() {
      var image, _i, _len, _ref;
      _ref = this.images;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        image = _ref[_i];
        this.removeImage(image);
      }
      return this.images = [];
    };

    return Morpher;

  }).call(this, MorpherJS.EventDispatcher);

  window.Morpher = MorpherJS.Morpher;

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MorpherJS.Point = (function(_super) {

    __extends(Point, _super);

    Point.prototype.x = 0;

    Point.prototype.y = 0;

    Point.prototype.mesh = null;

    function Point(x, y, params) {
      if (params == null) {
        params = {};
      }
      this.reset = __bind(this.reset, this);

      this.fromJSON = __bind(this.fromJSON, this);

      this.toJSON = __bind(this.toJSON, this);

      this.transform = __bind(this.transform, this);

      this.distanceTo = __bind(this.distanceTo, this);

      this.clone = __bind(this.clone, this);

      this.remove = __bind(this.remove, this);

      this.setY = __bind(this.setY, this);

      this.getY = __bind(this.getY, this);

      this.setX = __bind(this.setX, this);

      this.getX = __bind(this.getX, this);

      if (params.mesh != null) {
        this.mesh = params.mesh;
      }
      this.setX(x, {
        silent: true
      });
      this.setY(y, {
        silent: true
      });
    }

    Point.prototype.getX = function() {
      return this.x;
    };

    Point.prototype.setX = function(x, params) {
      if (params == null) {
        params = {};
      }
      if ((this.mesh != null) && this.mesh.maxWidth) {
        x = Math.max(0, Math.min(this.mesh.maxWidth, x));
      }
      if (this.x !== x) {
        this.x = x;
        if (!params.silent) {
          return this.trigger('change:x change', this);
        }
      }
    };

    Point.prototype.getY = function() {
      return this.y;
    };

    Point.prototype.setY = function(y, params) {
      if (params == null) {
        params = {};
      }
      if ((this.mesh != null) && this.mesh.maxHeight) {
        y = Math.max(0, Math.min(this.mesh.maxHeight, y));
      }
      if (this.y !== y) {
        this.y = y;
        if (!params.silent) {
          return this.trigger('change:y change', this);
        }
      }
    };

    Point.prototype.remove = function() {
      return this.trigger('remove', this);
    };

    Point.prototype.clone = function() {
      return new MorpherJS.Point(this.x, this.y);
    };

    Point.prototype.distanceTo = function(point) {
      return Math.sqrt(Math.pow(point.x - this.x, 2) + Math.pow(point.y - this.y, 2));
    };

    Point.prototype.transform = function(matrix) {
      var tmpX, tmpY;
      tmpX = matrix.get(0, 0) * this.x + matrix.get(0, 1) * this.y + matrix.get(0, 2);
      tmpY = matrix.get(1, 0) * this.x + matrix.get(1, 1) * this.y + matrix.get(1, 2);
      this.x = tmpX;
      return this.y = tmpY;
    };

    Point.prototype.toJSON = function() {
      return {
        x: this.x,
        y: this.y
      };
    };

    Point.prototype.fromJSON = function(json, params) {
      if (json == null) {
        json = {};
      }
      if (params == null) {
        params = {};
      }
      if (params.hard) {
        this.reset();
      }
      this.setX(json.x, params);
      return this.setY(json.y, params);
    };

    Point.prototype.reset = function() {
      this.x = null;
      return this.y = null;
    };

    return Point;

  })(MorpherJS.EventDispatcher);

}).call(this);
(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  MorpherJS.Triangle = (function(_super) {

    __extends(Triangle, _super);

    Triangle.prototype.p1 = null;

    Triangle.prototype.p2 = null;

    Triangle.prototype.p3 = null;

    function Triangle(p1, p2, p3) {
      this.draw = __bind(this.draw, this);

      this.visualize = __bind(this.visualize, this);

      this.getHeight = __bind(this.getHeight, this);

      this.getBounds = __bind(this.getBounds, this);

      this.transform = __bind(this.transform, this);

      this.clone = __bind(this.clone, this);

      this.hasPoint = __bind(this.hasPoint, this);

      this.remove = __bind(this.remove, this);
      this.p1 = p1;
      this.p2 = p2;
      this.p3 = p3;
      this.p1.on('remove', this.remove);
      this.p2.on('remove', this.remove);
      this.p3.on('remove', this.remove);
    }

    Triangle.prototype.remove = function() {
      return this.trigger('remove', this);
    };

    Triangle.prototype.hasPoint = function(p) {
      return this.p1 === p || this.p2 === p || this.p3 === p;
    };

    Triangle.prototype.clone = function() {
      var triangle;
      return triangle = new MorpherJS.Triangle(this.p1.clone(), this.p2.clone(), this.p3.clone());
    };

    Triangle.prototype.transform = function(matrix) {
      this.p1.transform(matrix);
      this.p2.transform(matrix);
      return this.p3.transform(matrix);
    };

    Triangle.prototype.getBounds = function() {
      var bottom, left, p, right, top, _i, _len, _ref;
      left = right = this.p1.x;
      top = bottom = this.p1.y;
      _ref = [this.p2, this.p3];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        left = Math.min(left, p.x);
        right = Math.max(right, p.x);
        top = Math.min(top, p.y);
        bottom = Math.max(bottom, p.y);
      }
      return [left, top, right, bottom];
    };

    Triangle.prototype.getHeight = function(pointNumber) {
      var point;
      if (pointNumber == null) {
        pointNumber = 3;
      }
      return point = this["p" + pointNumber];
    };

    Triangle.prototype.visualize = function(el, draggable) {
      if (draggable == null) {
        draggable = false;
      }
      this.p1.visualize(el, draggable);
      this.p2.visualize(el, draggable);
      return this.p3.visualize(el, draggable);
    };

    Triangle.prototype.draw = function(sourceBitmap, destinationCtx, destinationTriangle) {
      var bottom, from, height, left, matr1, matr2, right, rotation2, scaleX, scaleY, state2, state3, to, top, width, _ref;
      _ref = this.getBounds(), left = _ref[0], top = _ref[1], right = _ref[2], bottom = _ref[3];
      width = right - left;
      height = bottom - top;
      matr1 = new MorpherJS.Matrix();
      matr1.translate(-this.p1.x, -this.p1.y);
      matr1.rotate(-Math.atan2(this.p2.y - this.p1.y, this.p2.x - this.p1.x));
      from = this.clone();
      from.transform(matr1.apply());
      matr2 = new MorpherJS.Matrix();
      rotation2 = Math.atan2(destinationTriangle.p2.y - destinationTriangle.p1.y, destinationTriangle.p2.x - destinationTriangle.p1.x);
      matr2.translate(-destinationTriangle.p1.x, -destinationTriangle.p1.y);
      matr2.rotate(-rotation2);
      to = destinationTriangle.clone();
      to.transform(matr2.apply());
      scaleX = to.p2.x / from.p2.x;
      scaleY = to.p3.y / from.p3.y;
      matr1.scale(scaleX, scaleY);
      state2 = this.clone();
      state2.transform(matr1.apply());
      matr1.shear((to.p3.x - from.p3.x * scaleX) / (from.p3.y * scaleY));
      state3 = this.clone();
      state3.transform(matr1.apply());
      matr1.rotate(rotation2);
      matr1.translate(destinationTriangle.p1.x, destinationTriangle.p1.y);
      destinationCtx.save();
      destinationCtx.setTransform.apply(destinationCtx, matr1.apply(true).toTransform());
      destinationCtx.beginPath();
      destinationCtx.moveTo(this.p1.x, this.p1.y);
      destinationCtx.lineTo(this.p2.x, this.p2.y);
      destinationCtx.lineTo(this.p3.x, this.p3.y);
      destinationCtx.closePath();
      destinationCtx.clip();
      destinationCtx.drawImage(sourceBitmap, left, top, width, height, left, top, width, height);
      return destinationCtx.restore();
    };

    return Triangle;

  })(Backbone.Model);

}).call(this);
