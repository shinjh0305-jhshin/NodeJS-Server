const db = require('./db');
const template = require('./template');

module.exports = {
    home:function(req, res) {
        db.query('SELECT * FROM AUTHOR', function(err, author) {
            const title = 'Author';
            const html = template.HTML(title, req.list, `
                    <h2>${title}</h2>${template.authorTable(author)}
                    <form action="/author/create_process" method="post">
                        <p><input type="text" name="name" placeholder="New Author"></p>
                        <p>
                            <textarea name="profile" placeholder="Author description"></textarea>
                        </p>
                        <p><input type="submit" value="생성"></p>
                    </form>
                `);
        
            try {
                res.send(html);
            } catch (error) {
                res.send(error.message);
            }
        })
    },
    create_process:function(req, res) {
        const body = req.body;
        const name = body.name;
        const profile = body.profile;
    
        db.query(`INSERT INTO AUTHOR(NAME, PROFILE)
                  VALUES(?, ?)`, [name, profile],
                  function(err, result) {
                    try {
                        res.redirect(`/author`); 
                    } catch (error) {
                        res.send(error.message);
                    }
                }
        )
    },
    update:function(req, res) {
        db.query('SELECT * FROM AUTHOR', function(err, authors) {
            const authorID = req.params.authorId;
            db.query('SELECT * FROM AUTHOR WHERE ID = ?', [authorID], function(err, author) {
                const title = 'Author Update';
                const html = template.HTML(title, req.list, `
                        <h2>${title}</h2>${template.authorTable(authors)}
                        <form action="/author/update_process" method="post">
                            <input type="hidden" name="id" value="${authorID}">
                            <p><input type="text" name="name" value="${author[0].NAME}"></p>
                            <p>
                                <textarea name="profile">${author[0].PROFILE}</textarea>
                            </p>
                            <p><input type="submit" value="수정"></p>
                        </form>
                    `);
            
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
        const authorid = body.id;
        const name = body.name;
        const profile = body.profile;

        db.query('UPDATE AUTHOR SET NAME = ?, PROFILE = ? WHERE ID = ?', [name, profile, authorid], function(err, result) {
            try {
                res.redirect(`/author`); 
            } catch (error) {
                res.send(error.message);
            }
        })
    },
    delete_process:function(req, res) {
        const body = req.body;
        const authorid = body.id;
        db.query('DELETE FROM AUTHOR WHERE ID = ?', [authorid], function(err, result) {
            try {
                res.redirect(`/author`); 
            } catch (error) {
                res.send(error.message);
            }
        })
    }
}