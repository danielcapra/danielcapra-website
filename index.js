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

    const text = `<?xml version="1.0" encoding="UTF-8"?><rss xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom" version="2.0" xmlns:cc="http://cyber.law.harvard.edu/rss/creativeCommonsRssModule.html">
    <channel>
        <title><![CDATA[Stories by Daniel Capra on Medium]]></title>
        <description><![CDATA[Stories by Daniel Capra on Medium]]></description>
        <link>https://medium.com/@danielcapra?source=rss-8717e15cbfc4------2</link>
        <image>
            <url>https://cdn-images-1.medium.com/fit/c/150/150/1*fGfpwnGA7NsULX8RLBhadg.png</url>
            <title>Stories by Daniel Capra on Medium</title>
            <link>https://medium.com/@danielcapra?source=rss-8717e15cbfc4------2</link>
        </image>
        <generator>Medium</generator>
        <lastBuildDate>Mon, 18 Dec 2023 11:16:37 GMT</lastBuildDate>
        <atom:link href="https://medium.com/@danielcapra/feed" rel="self" type="application/rss+xml"/>
        <webMaster><![CDATA[yourfriends@medium.com]]></webMaster>
        <atom:link href="http://medium.superfeedr.com" rel="hub"/>
        <item>
            <title><![CDATA[Swift’s AsyncStream Explained]]></title>
            <link>https://blog.stackademic.com/swifts-asyncstream-explained-127d84078424?source=rss-8717e15cbfc4------2</link>
            <guid isPermaLink="false">https://medium.com/p/127d84078424</guid>
            <category><![CDATA[combine]]></category>
            <category><![CDATA[swift]]></category>
            <category><![CDATA[asyncstream]]></category>
            <category><![CDATA[asynchronous]]></category>
            <category><![CDATA[asyncawait]]></category>
            <dc:creator><![CDATA[Daniel Capra]]></dc:creator>
            <pubDate>Fri, 24 Nov 2023 18:27:40 GMT</pubDate>
            <atom:updated>2023-11-27T01:00:29.603Z</atom:updated>
            <content:encoded><![CDATA[<h4>What is AsyncStream and how to use it</h4><figure><img alt="" src="https://cdn-images-1.medium.com/max/1024/0*nS892-oI6tA1iBsP" /><figcaption>Photo by <a href="https://unsplash.com/@clark_fransa?utm_source=medium&amp;utm_medium=referral">Arnold Francisca</a> on <a href="https://unsplash.com?utm_source=medium&amp;utm_medium=referral">Unsplash</a></figcaption></figure><p>Swift 5.5 introduced async/await for writing asynchronous code in a more linear &amp; readable style, and along with it came a bunch of tools to manage and handle asynchronous operations more effectively. One of those tools is AsyncStream, about which I’ll be sharing all my knowledge here.</p><h4>AsyncSequence</h4><p>To understand AsyncStream, let’s touch on the protocol it conforms to, AsyncSequence. According to Apple’s documentation:</p><blockquote>A type that provides asynchronous, sequential, iterated access to its elements. An AsyncSequence resembles the Sequence type — offering a list of values you can step through one at a time — and adds asynchronicity. An AsyncSequence may have all, some, or none of its values available when you first use it. Instead, you use await to receive values as they become available.</blockquote><p>In simpler terms, it enables handling an unknown, potentially infinite number of asynchronously generated elements, such as data fetched from a network or live data streams.</p><p><strong>How do we iterate over it?</strong></p><p>Similar to Sequence, we use a for in loop, only this time we use the await keyword, since we have to potentially wait for values.</p><pre>let counter = Counter(limit: 10) // where Counter conforms to AsyncSequence<br>// Iterate asynchronously<br>for await number in counter {<br>  print(number, terminator: &quot; &quot;) // prints 1 2 3 4 5 6 7 8 9 10<br>}</pre><p>In fact, any time we interact with an AsyncSequence we use the await keyword, even for single-value methods:</p><pre>let item = await Counter(limit: 10).first(where: { $0 &gt; 5 }) // Optional(6)</pre><h4>What’s AsyncStream then?</h4><p>In essence, it’s a type that already conforms to AsyncSequence, providing an easy way to create an asynchronous sequence without manually implementing an asynchronous iterator.</p><p><strong>What’s it good for?</strong></p><p>It’s commonly used to adapt callback or Combine-based APIs to work with async-await.</p><pre>// Say we have an older API that&#39;s based on callbacks<br>class SomeService {<br>    func someData(_ completion: @escaping (String) -&gt; Void) {<br>        let items: [String] = [&quot;apple&quot;, &quot;banana&quot;, &quot;pear&quot;]<br><br>        // This will call the completion block:<br>        // After 1 second for item &quot;apple&quot;<br>        // After 2 seconds for item &quot;banana&quot;<br>        // After 3 seconds for item &quot;pear&quot;<br>        for index in items.indices {<br>            let workItem = DispatchWorkItem { completion(items[index]) }<br>            DispatchQueue.global().asyncAfter(deadline: .now() + Double(index) + 1, execute: workItem)<br>        }<br>    }<br>}<br><br>class SomeViewModel: ObservableObject {<br>    let service = SomeService()<br><br>    // Using classic callback closure<br>    func getData() {<br>        let now = Date()<br>        service.someData { item in<br>            print(&quot;Item: \(item) // Printed after: \(-Int(now.timeIntervalSinceNow)) seconds&quot;)<br>        }<br>    }<br>}<br>// Output:<br>// Item: apple // Printed after: 1 seconds<br>// Item: banana // Printed after: 2 seconds<br>// Item: pear // Printed after: 3 seconds</pre><p>That approach did the job back then, but things have evolved for the better. Let’s dive into adapting this for async-await syntax.</p><p>Firstly, let’s set up our AsyncStream:</p><pre>// Let&#39;s convert the old API in SomeService to async-await using AsyncStream<br>extension SomeService {<br>    var asyncStream: AsyncStream&lt;String&gt; {<br>        // 1. Initialise a new AsyncStream, specifying its generic type<br>        AsyncStream&lt;String&gt; { continuation in<br>            // 2. Call function with callback closure<br>            someData { item in<br>                // 3. Forward data to the stream using continuation.yield(_:) method<br>                continuation.yield(item)<br>            }<br><br>            // 4. When we&#39;re done with the data, call continuation.finish() to signify the end of the continuation<br>            // In this case we&#39;ll call finish() after 4 seconds (just in time for all our items to publish)<br>            let workItem = DispatchWorkItem { continuation.finish() }<br>            DispatchQueue.global().asyncAfter(deadline: .now() + 4, execute: workItem)<br><br>            // 5. Handle termination<br>            continuation.onTermination = { termination in<br>                switch termination {<br>                case .finished:<br>                    // continuation.finish() was called<br>                    print(&quot;Stream finished.&quot;)<br>                case .cancelled:<br>                    // Task was cancelled<br>                    print(&quot;Stream cancelled.&quot;)<br>                }<br>            }<br>        }<br>    }<br>}</pre><p>Now we’re able to use it like so:</p><pre>extension SomeViewModel {<br>    // Using async-await syntax<br>    func getDataAsynchronously() {<br>        let now = Date()<br>        Task {<br>            // Asynchronously iterate over items<br>            for await item in service.asyncStream {<br>                print(&quot;Item: \(item) // Printed after: \(-Int(now.timeIntervalSinceNow)) seconds&quot;)<br>            }<br>        }<br>    }<br>}<br>// Output:<br>// Item: apple // Printed after: 1 seconds<br>// Item: banana // Printed after: 2 seconds<br>// Item: pear // Printed after: 3 seconds<br>// Stream finished.</pre><h4>Combine Publishers with AsyncStream</h4><p>Now, onto my favorite use of AsyncStream — receiving elements from publishers using async-await syntax.</p><p>Let’s kick things off by setting up our publisher:</p><pre>class SomeCombineService {<br>    // You can use any publisher you want, I&#39;ll be using a passthrough subject for this example<br>    let passthroughPublisher: PassthroughSubject&lt;String, Never&gt; = .init()<br><br>    func startPublisher() {<br>        let items = [&quot;apple&quot;, &quot;banana&quot;, &quot;pear&quot;]<br><br>        // This will publish:<br>        // Item &quot;apple&quot; after 1 second<br>        // Item &quot;banana&quot; after 2 seconds<br>        // Item &quot;pear&quot; after 3 seconds<br>        for index in items.indices {<br>            let workItem = DispatchWorkItem { [weak self] in<br>                self?.passthroughPublisher.send(items[index])<br>            }<br>            DispatchQueue.global().asyncAfter(deadline: .now() + Double(index) + 1, execute: workItem)<br>        }<br>    }<br>}</pre><p>Next, let&#39;s make use of AsyncStream to adapt it for use with async-await syntax:</p><pre>extension SomeCombineService {<br>    var asyncStream: AsyncStream&lt;String&gt; {<br>        return AsyncStream&lt;String&gt; { continuation in<br>            // Subscribe to publisher &amp;<br>            // Store a reference to the cancellable to cancel it when continuation finishes<br>            let cancellable = passthroughPublisher<br>            // Any combine methods you please go here<br>                .sink { item in<br>                    // Forward data to the stream<br>                    continuation.yield(item)<br>                }<br><br>            // This time, we won&#39;t call continuation.finish(), instead we&#39;ll cancel the task in our View Model<br><br>            continuation.onTermination = { termination in<br>                switch termination {<br>                case .finished:<br>                    print(&quot;Stream finished.&quot;)<br>                case .cancelled:<br>                    print(&quot;Stream cancelled.&quot;)<br>                }<br>                // Cancel subscriber<br>                cancellable.cancel()<br>            }<br><br>            // Start publisher<br>            startPublisher()<br>        }<br>    }<br>}</pre><p>And there we have it — now it can be used as follows:</p><pre>class SomeCombineViewModel: ObservableObject {<br>    let service = SomeCombineService()<br><br>    func subscribeToAsyncStream() {<br>        let now = Date()<br>        let task = Task {<br>            // Iterate over AsyncStream<br>            for await item in service.asyncStream {<br>                print(&quot;Item: \(item) // Printed after: \(-Int(now.timeIntervalSinceNow)) seconds&quot;)<br>            }<br>        }<br>        let workItem = DispatchWorkItem { task.cancel() }<br>        // Cancel task after 4 seconds (just in time for all our items to publish)<br>        DispatchQueue.global().asyncAfter(deadline: .now() + 4, execute: workItem)<br>    }<br>}<br>// Output:<br>// Item: apple // Printed after: 1 seconds<br>// Item: banana // Printed after: 2 seconds<br>// Item: pear // Printed after: 3 seconds<br>// Stream cancelled.</pre><p><strong>Quick tip:</strong></p><p>If you’re targeting iOS 15 and above, I recommend you leverage the .values property rather than creating an AsyncStream for your publisher. This property is available on any Combine publisher with a Failure type of Never, providing the publisher’s elements as an asynchronous sequence. Here’s how you can use it:</p><pre>Task {<br>    for await item in service.passthroughPublisher.values {<br>        // handle each published item<br>    }<br>}</pre><h4>AsyncThrowingStream</h4><p>If the callback function or the combine publisher you’re looking to adapt for async-await syntax throws, you should use AsyncThrowingStream instead. It works pretty much the same way besides the fact that, well, it can throw.</p><pre>// Key differences:<br>var throwingStream: AsyncThrowingStream&lt;String, Error&gt; { // Initialised with 2 generic types<br>    return AsyncThrowingStream&lt;String, Error&gt; { continuation in<br>        // Can yield a failed result<br>        continuation.yield(with: .failure(Error))<br>        // Can finish throwing<br>        continuation.finish(throwing: Error?)<br><br>        // onTermination will hold the thrown error if continuation finished by throwing<br>        continuation.onTermination = { termination in<br>            switch termination {<br>            case .finished(let error):<br>                // Check for error<br>            case .cancelled:<br>                // ...<br>            }<br>        }<br>    }<br>}<br><br>// Iterating over it will require try keyword<br>for try await item in throwingStream {<br>    // ...<br>}<br><br>// Same for accessing single-value methods<br>let item = try await throwingStream.first(where: { $0 == &quot;banana&quot; })</pre><h4>That’s it!</h4><p>You should now be able to go and use AsyncStream in your own projects and leverage async-await syntax even with older APIs. That’s practically all the use cases I’ve seen but if there’s more information you want to share, don’t hesitate to comment below.</p><h3>Stackademic</h3><p><em>Thank you for reading until the end. Before you go:</em></p><ul><li><em>Please consider </em><strong><em>clapping</em></strong><em> and </em><strong><em>following</em></strong><em> the writer! 👏</em></li><li><em>Follow us on </em><a href="https://twitter.com/stackademichq"><strong><em>Twitter(X)</em></strong></a><em>, </em><a href="https://www.linkedin.com/company/stackademic"><strong><em>LinkedIn</em></strong></a><em>, and </em><a href="https://www.youtube.com/c/stackademic"><strong><em>YouTube</em></strong></a><strong><em>.</em></strong></li><li><em>Visit </em><a href="http://stackademic.com/"><strong><em>Stackademic.com</em></strong></a><em> to find out more about how we are democratizing free programming education around the world.</em></li></ul><img src="https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=127d84078424" width="1" height="1" alt=""><hr><p><a href="https://blog.stackademic.com/swifts-asyncstream-explained-127d84078424">Swift’s AsyncStream Explained</a> was originally published in <a href="https://blog.stackademic.com">Stackademic</a> on Medium, where people are continuing the conversation by highlighting and responding to this story.</p>]]></content:encoded>
        </item>
        <item>
            <title><![CDATA[How to let users sample a color on macOS in Swift]]></title>
            <link>https://blog.stackademic.com/how-to-let-users-sample-a-color-on-macos-in-swift-6c2efa219696?source=rss-8717e15cbfc4------2</link>
            <guid isPermaLink="false">https://medium.com/p/6c2efa219696</guid>
            <category><![CDATA[screencapturekit]]></category>
            <category><![CDATA[macos]]></category>
            <category><![CDATA[swift]]></category>
            <category><![CDATA[appkit]]></category>
            <category><![CDATA[color-picker]]></category>
            <dc:creator><![CDATA[Daniel Capra]]></dc:creator>
            <pubDate>Wed, 22 Nov 2023 17:38:56 GMT</pubDate>
            <atom:updated>2023-11-24T00:50:45.232Z</atom:updated>
            <content:encoded><![CDATA[<p>Here goes my 1st Medium article.</p><p>Whether you’re building a color picker or an utilities app, you might want to add color sampling functionality and upon googling a bit, realise there aren’t many options to choose from out there. Well you ended up in the right place, I will share you with you everything you need to know about color sampling on macOS.</p><h4>NSColorSampler (macOS 10.15+)</h4><p>If you’re looking for the quickest &amp; simplest solution, you can’t go wrong with AppKit’s NSColorSampler. Most importantly, using it doesn’t require screen sharing permission from your users.</p><p><em>Here’s how you would use it:</em></p><pre>let sampler = NSColorSampler()<br><br>    func sampleColor() {<br>        sampler.show { selectedColor in<br>            // selectedColor will come back as nil if user cancels<br>            guard let selectedColor = selectedColor else { return }<br>            // selectedColor comes back in NSColor format<br>            // ...<br><br>        }<br>    }<br>    // NSColorSampler also has an async method<br>    // that should be preffered when using async/await Swift concurrency in your app<br>    func sample() async {<br>        let selectedColor = await sampler.sample()<br>        // Check if user cancelled<br>        guard let selectedColor = selectedColor else { return }<br>        // ...<br>    }</pre><p><strong>Pros:</strong></p><ul><li>Easy to use, comes native in AppKit</li><li>Doesn’t require screen sharing permission</li></ul><p><strong>Cons:</strong></p><ul><li>No customisation</li><li>Don’t have access to hovered colors, you only receive the color after the user selects one</li></ul><h4>SCColorSampler (macOS 12.3+)</h4><figure><img alt="" src="https://cdn-images-1.medium.com/max/1024/1*-3SnAFGu5qCC2epcDlwb1Q.gif" /><figcaption>SCColorSampler demo</figcaption></figure><p>If NSColorSampler isn’t enough for you and you’re targeting macOS 12.3 and above, you’re in luck! SCColorSampler is the most customisable color sampler swift package out there (I happen to be its creator).</p><p>You can add it to your project through Swift Package Manager by adding the github link: <a href="https://github.com/danielcapra/SCColorSampler">https://github.com/danielcapra/SCColorSampler</a>.</p><p><em>Here’s how you would use it:</em></p><pre>import SCColorSampler<br><br>class YourClassName {<br>    func sampleColor() {<br>        // Initialise a configuration object<br>        let configuration = SCColorSamplerConfiguration()<br><br>        // Customise to your needs<br>        configuration.loupeSize = .large<br>        configuration.loupeShape = .circle<br>        // ...<br><br>        // I recommend reading the github page&#39;s readme<br>        // to familiarise yourself with all the customisation available<br><br>        // Call sample function<br>        SCColorSampler.sample(configuration: configuration) { hoveredColor in<br>            // hoveredColor is the color at the user&#39;s cursor<br>            // This closure runs every time users moves their mouse<br>            // It will never come back as nil, and will be in NSColor format<br>            // ...<br>        } selectionHandler: { selectedColor in<br>            // selectedColor will come back as nil when user cancels (i.e. pressing ESC)<br>            guard let selectedColor = selectedColor else { return }<br>            // If user didn&#39;t cancel, means they clicked to select a color from their screen<br>            // selectedColor will be in NSColor format<br>            // ...<br>        }<br>    }<br>}</pre><p><strong>Pros:</strong></p><ul><li>Lots of customisation available</li><li>Based on latest Apple screen recording API: ScreenCaptureKit</li></ul><p><strong>Cons:</strong></p><ul><li>Requires screen sharing permission from your users</li><li>Available only from macOS 12.3</li></ul><h4>DSFColorSampler (macOS 10.10+)</h4><p>Even though it offers less customisation, it’s a really good solution for all you out there targeting below macOS 12.3. You can add it to your project through Swift Package Manager by adding the github link: <a href="https://github.com/dagronf/DSFColorSampler">https://github.com/dagronf/DSFColorSampler</a>.</p><p>One thing to note is that it uses CGWindowListCreateImage which was deprecated as of macOS 14. You might think that’s not a big problem but since Apple is pushing their new API ScreenCaptureKit, some people have noticed Apple is showing these nasty alerts on apps using this CGWindowStream &amp; CGWindowListCreateImage: <a href="https://bugs.chromium.org/p/chromium/issues/detail?id=1457180">https://bugs.chromium.org/p/chromium/issues/detail?id=1457180</a>. So I would recommend you only use this package for any version below macOS 14 and switch to a different solution mentioned above for 14 and above.</p><h4>Create your own!</h4><p>That’s what I did! I wasn’t pleased with anything I found out there and that’s how SCColorSampler was born. It is definitely more work but only that way could you create a solution that fits your needs perfectly.</p><p>As a start I recommend you explore CGWindowListCreateImage for anything below macOS 12.3 &amp; ScreenCaptureKit for anything above that. You could check out both repositories of <a href="https://github.com/danielcapra/SCColorSampler">SCColorSampler</a> &amp; <a href="https://github.com/dagronf/DSFColorSampler">DSFColorSampler</a> to get some initial ideas and go from there. Good luck on your journey, soldier!</p><h3>Stackademic</h3><p><em>Thank you for reading until the end. Before you go:</em></p><ul><li><em>Please consider </em><strong><em>clapping</em></strong><em> and </em><strong><em>following</em></strong><em> the writer! 👏</em></li><li><em>Follow us on </em><a href="https://twitter.com/stackademichq"><strong><em>Twitter(X)</em></strong></a><em>, </em><a href="https://www.linkedin.com/company/stackademic"><strong><em>LinkedIn</em></strong></a><em>, and </em><a href="https://www.youtube.com/c/stackademic"><strong><em>YouTube</em></strong></a><strong><em>.</em></strong></li><li><em>Visit </em><a href="http://stackademic.com/"><strong><em>Stackademic.com</em></strong></a><em> to find out more about how we are democratizing free programming education around the world.</em></li></ul><img src="https://medium.com/_/stat?event=post.clientViewed&referrerSource=full_rss&postId=6c2efa219696" width="1" height="1" alt=""><hr><p><a href="https://blog.stackademic.com/how-to-let-users-sample-a-color-on-macos-in-swift-6c2efa219696">How to let users sample a color on macOS in Swift</a> was originally published in <a href="https://blog.stackademic.com">Stackademic</a> on Medium, where people are continuing the conversation by highlighting and responding to this story.</p>]]></content:encoded>
        </item>
    </channel>
</rss>`

const data = new DOMParser().parseFromString(text, 'text/xml');

// TODO: Uncomment for production
    // fetch(url)
    //     .then(response => response.text())
    //     .then(str => new DOMParser().parseFromString(str, "text/xml"))
        // .then(data => {
            // console.log(data)
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
                const date = `${parsedDate.getDate()} ${new Intl.DateTimeFormat("en-US", { month: "short"}).format(parsedDate)} ${parsedDate.getFullYear()}`

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

            const projectsContainer = document.getElementById("proj-container");
            projectsContainer.insertAdjacentHTML("afterend", `
            <div class="articles-container" id="art-container">
                <h1>Articles</h1>
                ${html}
            </div>
            `)
        // })
})();