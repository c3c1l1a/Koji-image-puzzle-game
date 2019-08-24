"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _database = _interopRequireDefault(require("@withkoji/database"));

var _uuid = _interopRequireDefault(require("uuid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var _default = function _default(app) {
  app.get('/test',
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(req, res) {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              res.status(200).json({
                test: true,
                more: 'more'
              });

            case 1:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
  app.get('/leaderboard',
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(req, res) {
      var database, rawScores, scores;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              database = new _database.default();
              _context2.next = 3;
              return database.get('leaderboard');

            case 3:
              rawScores = _context2.sent;
              // We don't want to return private attributes to consumers of this
              // endpoint, so strip them out, sort the records so the top scores
              // appear first, and then only return the top 100 scores
              scores = rawScores.map(function (_ref3) {
                var name = _ref3.name,
                    score = _ref3.score,
                    dateCreated = _ref3.dateCreated;
                return {
                  name: name,
                  score: score,
                  dateCreated: dateCreated
                };
              }).sort(function (a, b) {
                return b.score - a.score;
              }).slice(0, 100);
              res.status(200).json({
                success: true,
                scores: scores
              });

            case 6:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
  app.post('/leaderboard/save',
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(req, res) {
      var recordId, recordBody, database;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              recordId = _uuid.default.v4();
              recordBody = {
                name: req.body.name,
                score: req.body.score,
                privateAttributes: req.body.privateAttributes,
                dateCreated: Math.round(Date.now() / 1000)
              };
              database = new _database.default();
              _context3.next = 5;
              return database.set('leaderboard', recordId, recordBody);

            case 5:
              res.status(200).json({
                success: true
              });

            case 6:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    }));

    return function (_x5, _x6) {
      return _ref4.apply(this, arguments);
    };
  }());
};

exports.default = _default;