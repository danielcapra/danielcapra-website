function copyMailToClipboard() {

    const copyText = "hi@danielcapra.com";

    const type = "text/plain";
    const blob = new Blob([copyText], { type });
    const data = [new ClipboardItem({ [type]: blob })];

    navigator.clipboard.write(data).then(
        () => {
            /* success */
            // Alert the copied text
            alert(copyText + " copied to clipboard!");
        },
        () => {
            /* failure */
            alert("Tried to copy " + copyText + " to clipboard but failed. Try again or select and copy manually!")
        },
    );
}

(function () {
    // Populate articles
    const url = `https://faas-lon1-917a94a7.doserverless.co/api/v1/web/fn-a60ef413-89e5-4fc6-87a7-2fdaa485245f/default/medium-rss-feed`;

    fetch(url)
        .then(response => response.text())
        .then(str => new DOMParser().parseFromString(str, "text/xml"))
        .then(data => {
            const items = data.querySelectorAll("item");
            if (items.length < 1) { return };
            let html = ``;
            items.forEach(el => {
                const cdataRegex = /<!\[CDATA\[|]]>/g;

                const link = el.querySelector("link").innerHTML;

                const unparsedTitle = el.querySelector("title").innerHTML;
                const title = unparsedTitle.replace(cdataRegex, '');

                const unparsedDate = el.querySelector("pubDate").innerHTML;
                const parsedDate = new Date(Date.parse(unparsedDate));
                const date = `${parsedDate.getDate()} ${new Intl.DateTimeFormat("en-US", { month: "short" }).format(parsedDate)} ${parsedDate.getFullYear()}`

                const contentUnparsed = el.querySelector('encoded').innerHTML;
                const contentDiv = document.createElement("div");
                contentDiv.innerHTML = contentUnparsed;

                let content = "";
                contentDiv.querySelectorAll('p').forEach((element => {
                    if (content.length > 300) { return }
                    content += element.textContent + " ";
                }))

                const subtitle = contentDiv.innerHTML.split(">")[1].replace(/<[a-z&A-Z&0-9]*/g, '');

                html += `
                <div class="article">
                <div class="header">
                <a href="${link}" target="_blank" rel="noopener">
                        <h2>${title}</h2>
                    </a>
                    <date>${date}</date>
                </div>
                <p>${subtitle} - ${content}</p>
            </div>
                `;
            });

            const container = document.getElementById('grid');

            const newHtml = container.innerHTML.replace(`<!--articles_container-->`, `
            <div class="articles-container">
                <h1>Articles</h1>
                ${html}
            </div>
            `);

            container.innerHTML = newHtml;
        })
})();

(function () {
    // Populate projects
    fetch('projects.json')
        .then((response) => response.json())
        .then((json) => {
            if (json.length < 1) { return }

            let html = ``;
            json.forEach(proj => {

                html += `
                <div class="project">
                <div class="header">
                    <h2>
                        ${proj.title}
                    </h2>
                    <date>
                        <a href="${proj["link-link"]}" target="_blank" rel="noopener">
                        ${proj["link-title"]}</a>${proj["link-additional-text"]}
                    </date>
                </div>
                <p>
                    ${proj.description} 
                </p>
            </div>
                `;
            });

            const container = document.getElementById('grid');

            const newHtml = container.innerHTML.replace(`<!--projects_container-->`, `
            <div class="projects-container">
                <h1>Projects</h1>
                ${html}
            </div>
            `);

            container.innerHTML = newHtml;
        });
})();

(function () {
    // Populate links
    fetch('links.json')
        .then((response) => response.json())
        .then((json) => {
            if (json.length < 1) { return }

            let html = ``;
            json.forEach(link => {
                html += `<div class="link">`

                if (link.link == "hi@danielcapra.com") {
                    html += `
                        <button onclick="copyMailToClipboard()">
                        ${link.title}
                        </button>
                    `
                } else {
                    html += `
                        <a href="${link.link}" target="_blank" rel="noopener">
                        ${link.title}
                        </a>
                    `;
                }

                html +=`</div>`
            });

            // Animation
            json.forEach(link => {
                html += `<div class="link">`

                if (link.link == "hi@danielcapra.com") {
                    html += `
                        <button onclick="copyMailToClipboard()">
                        ${link.title}
                        </button>
                    `
                } else {
                    html += `
                        <a href="${link.link}" target="_blank" rel="noopener">
                        ${link.title}
                        </a>
                    `;
                }

                html +=`</div>`
            });

            const container = document.body;

            const newHtml = container.innerHTML.replace(`<!--links_container-->`, `
            <div class="links-background">
                <div class="links-container">
                    ${html}
                </div>
            </div>
            `);

            container.innerHTML = newHtml;
        });
})();