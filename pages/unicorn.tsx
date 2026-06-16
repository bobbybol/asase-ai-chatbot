export default function UnicornPage() {
  return (
    <html>
      <head>
          <title>Unicorn Magic</title>
          <script src="https://www.cornify.com/js/cornify.js"></script>
      </head>
      <body>
          <h1>Unicorn Magic!</h1>
          <p>Click the button below to summon unicorns.</p>
          <button onclick="cornify_add();">Summon Unicorn</button>
      </body>
    </html>
  );
}