var express = require('express');
var router = express.Router();
var path = require('path');
var fs = require('fs');
var sanitizeHtml = require('sanitize-html');
var shortid = require('shortid');
var template = require('../lib/template.js');
var auth = require('../lib/auth');
var db = require('../lib/db');

router.get('/create', function(request, response){
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var title = 'WEB - create';
  var list = template.list(request.list);
  var html = template.HTML(title, list, `
    <form action="/topic/create_process" method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit">
      </p>
    </form>
  `, '', auth.statusUI(request, response));
  response.send(html);
});

router.post('/create_process', async function(request, response){
  if(!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var id = shortid.generate();
  var title = post.title;
  var description = post.description;
  var user_id = request.user.ID;

  await db.query('INSERT INTO TOPICS VALUES(?,?,?,NOW(),?)', [id, title, description, user_id]);

  response.redirect(`/topic/${id}`);

});

router.get('/update/:pageId', function(request, response){
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var filteredId = path.parse(request.params.pageId).base;
  fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
    var title = request.params.pageId;
    var list = template.list(request.list);
    var html = template.HTML(title, list,
      `
      <form action="/topic/update_process" method="post">
        <input type="hidden" name="id" value="${title}">
        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
        <p>
          <textarea name="description" placeholder="description">${description}</textarea>
        </p>
        <p>
          <input type="submit">
        </p>
      </form>
      `,
      `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`,
      auth.statusUI(request, response)
    );
    response.send(html);
  });
});

router.post('/update_process', function(request, response){
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var id = post.id;
  var title = post.title;
  var description = post.description;
  fs.rename(`data/${id}`, `data/${title}`, function(error){
    fs.writeFile(`data/${title}`, description, 'utf8', function(err){
      response.redirect(`/topic/${title}`);
    })
  });
});

router.post('/delete_process', function(request, response){
  if (!auth.isOwner(request, response)) {
    response.redirect('/');
    return false;
  }
  var post = request.body;
  var id = post.id;
  var filteredId = path.parse(id).base;
  fs.unlink(`data/${filteredId}`, function(error){
    response.redirect('/');
  });
});

router.get('/:pageId', async function(request, response, next) { 
  var pageId = request.params.pageId;
  var [result] = await db.query('SELECT * FROM TOPICS LEFT OUTER JOIN USERS ON TOPICS.USER_ID = USERS.ID WHERE TOPICS.ID = ?', [pageId]);

  var title =  sanitizeHtml(result[0].TITLE);
  var description = sanitizeHtml(result[0].DESCRIPTION, { allowedTags: ['h1'] });
  var userName = sanitizeHtml(result[0].DISPLAYNAME);
  var list = template.list(request.list);
  var html = template.HTML(title, list,
    `<h2>${title}</h2>${description}<p>by ${userName}</p>`,
    ` <a href="/topic/create">create</a>
      <a href="/topic/update/${title}">update</a>
      <form action="/topic/delete_process" method="post">
        <input type="hidden" name="id" value="${pageId}">
        <input type="submit" value="delete">
      </form>`,
      auth.statusUI(request, response)
  );
  response.send(html);
});
module.exports = router;