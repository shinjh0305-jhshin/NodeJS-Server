module.exports = {
    HTML:function(title, list, body, control) {
        return `
        <!doctype html>
            <html>
            <head>
                <title>WEB1 - ${title}</title>
                <meta charset="utf-8">
            </head>
            <body>
                <h1><a href="/">WEB</a></h1>
                ${list}
                ${control}
                ${body}
            </body>                                         
        </html> `;
    },
    list:function(topics) {
        var list = '<ul>';
        
        list += topics.map(x => `<li><a href="/topic/${x.TITLE}">${x.TITLE}</a></li>`).join('')
        list += '</ul>';

        return list;
    },
    authorSelect:function(authors, author_id = 0) {
        let authorList = "";
        authorList += authors.map(x => `<option value=${x.ID} ${author_id === x.ID ? 'selected' : ''}>${x.NAME}</option>`).join('');
        return `<select name="author">${authorList}</select>`;
    }
}