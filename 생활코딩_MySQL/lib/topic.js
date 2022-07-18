const db = require('./db');
const template = require('./template')

module.exports = {
    common:function(req, next) {
        db.query('SELECT * FROM TOPIC', (err, topic) => {
            if (err) {
                console.error(err);
                return;
            }
            req.list = template.list(topic);
            next();
        })
    },
    home:function(req, res) {
        const title = 'Welcome';
        const description = 'Hello, Node.js';
        const createUpdate = '<a href="/topic/create">create</a>'; 
        const html = template.HTML(title, req.list, `
                <h2>${title}</h2><p>${description}</p><img src="/images/travel.jpg" style="width:300px; display:block; margin-top:10px;">`, 
                createUpdate);
    
        try {
            res.send(html);
        } catch (error) {
            res.send(error.message);
        }
    },
    page:function(req, res) {
        const title = req.params.pageId;
        
        db.query(`SELECT * FROM TOPIC LEFT JOIN AUTHOR ON TOPIC.AUTHOR_ID = AUTHOR.ID
                WHERE TITLE = ?`, [title], function(err, topics) {
            //주의 :: delete를 GET 방식으로 처리 할 경우, 링크로 타고 들어가서 아무나 다 망칠 수 있기에, POST 방식으로 한다.
            const title = topics[0].TITLE;
            const description = topics[0].DESCRIPTION;

            const createUpdate = `
            <a href="/topic/create">create</a> 
            <a href="/topic/update/${title}">update</a>
            <form action="/topic/delete_process" method="post" onsubmit="return confirm('정말로 삭제하시겠습니까?');">
                <input type="hidden" name="id" value="${title}">
                <input type="submit" value="delete">
            </form> `;
    
            const html = template.HTML(title, req.list, `<h2>${title}</h2><p>${description}</p><p>by ${topics[0].NAME}</p>`, createUpdate);
    
            try {
                res.send(html);
            } catch (error) {
                res.send(error.message);
            }
        }) 
    },
    create:function(req, res) {
        const title = 'Create';
        db.query('SELECT * FROM AUTHOR', function(err, authors) {
            const html = template.HTML(title, req.list, `
                <form action="/topic/create_process" method="post">
                    <p><input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>${template.authorSelect(authors)}</p>
                    <p><input type="submit"></p>
                </form>
            `, '');
            try {
                res.send(html);
            } catch (error) {
                res.send(error.message);
            }
        })
    },
    create_process:function(req, res) {
        const body = req.body;
        const title = body.title;
        const description = body.description;
        const author_id = body.author;
    
        db.query(`INSERT INTO TOPIC(TITLE, DESCRIPTION, CREATED, AUTHOR_ID)
                  VALUES(?, ?, NOW(), ?)`, [title, description, author_id],
                  function(err, result) {
                    try {
                        res.redirect(`/topic/${encodeURI(title)}`); //한글로 입력될 경우!
                    } catch (error) {
                        res.send(error.message);
                    }
                }
        )
    },
    update:function(req, res) {
        const title = req.params.pageId;

        db.query(`SELECT * FROM TOPIC WHERE TITLE = ?`, [title], function(err, topic) {
            db.query(`SELECT * FROM AUTHOR`, function(err, authors) {
                const title = topic[0].TITLE;
                const description = topic[0].DESCRIPTION;
        
                const html = template.HTML(title, req.list, `
                    <form action="/topic/update_process" method="post">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p>
                            <textarea name="description" placeholder="description" cols=100 rows=10>${description}</textarea>
                        </p>
                        <p>${template.authorSelect(authors, topic[0].AUTHOR_ID)}</p>
                        <p><input type="submit"></p>
                    </form>
                    `, `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`);
        
                try {
                    res.send(html);
                } catch (error) {
                    res.send(error.message);
                }
            })
        })
    },
    update_process:function(req, res) {
        const body = req.body;
        const title = body.title;
        const id = body.id;
        const description = body.description;
        const author_id = body.author;
    
        db.query('UPDATE TOPIC SET TITLE = ?, DESCRIPTION = ? , AUTHOR_ID = ? WHERE TITLE = ?', [title, description, author_id, id],
                function(err, result) {
                    try {
                        res.redirect(`/topic/${encodeURI(title)}`); //한글로 입력될 경우!
                    } catch (error) {
                        res.send(error.message);
                    }
         })
    },
    delete_process:function(req, res) {
        const body = req.body;
        const id = body.id;
    
        db.query('DELETE FROM TOPIC WHERE TITLE = ?', [id], function(err, result) {
            try {
                res.redirect('/');
            } catch (error) {
                res.send(error.message);
            }
        })
    }
}