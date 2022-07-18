module.exports = {
    HTML:function(title, list, body, control="") {
        return `
        <!doctype html>
            <html>
            <head>
                <meta charset="utf-8">
                <title>WEB1 - ${title}</title>
                <link rel="stylesheet" href="/style.css">
            </head>
            <body>
                <h1><a href="/">WEB</a></h1>
                <a href="/author">author</a>
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
    },
    authorTable:function(authors) {
        let table = '<table>';
        table += authors.map(x => `
        <tr>
            <td>${x.NAME}</td>
            <td>${x.PROFILE}</td>
            <td><a href="/author/update/${x.ID}">update</td>
            <td>
                <form action="/author/delete_process" method="post">
                    <input type="hidden" name="id" value="${x.ID}">
                    <input type="submit" value="delete">
                </form>
            </td>
        </tr>`).join('');
        table += '</table>';
        return table;
    }
}