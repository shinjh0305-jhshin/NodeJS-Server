module.exports = {
    HTML:function templateHTML(title, list, body, control) {
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
    list:function templateList(topics) {
        var list = '<ul>';
        
        list += topics.map(x => `<li><a href="/topic/${x.TITLE}">${x.TITLE}</a></li>`).join('')
        list += '</ul>';

        return list;
    }
}