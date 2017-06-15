/**
 * Created by a58 on 2017/6/9.
 */
var Db = require('./db');
var poolModule = require('generic-pool');
var pool = poolModule.Pool({
    name     : 'mongoPool',
    create   : function(callback) {
        var mongodb = Db();
        mongodb.open(function (err, db) {
            callback(err, db);
        })
    },
    destroy  : function(mongodb) {
        mongodb.close();
    },
    max      : 100,
    min      : 5,
    idleTimeoutMillis : 30000,
    log      : true
});


function Comment(name, day, title, comment) {
    this.name = name;
    this.day = day;
    this.title = title;
    this.comment = comment;
}

module.exports = Comment;

//存储一条留言信息
Comment.prototype.save = function(callback) {
    var name = this.name,
        day = this.day,
        title = this.title,
        comment = this.comment;
    //打开数据库
    pool.acquire(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                pool.release();
                return callback(err);
            }
            //通过用户名、时间及标题查找文档，并把一条留言对象添加到该文档的 comments 数组里
            collection.update({
                "name": name,
                "time.day": day,
                "title": title
            }, {
                $push: {"comments": comment}
            } , function (err) {
                pool.release();
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};