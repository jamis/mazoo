MAZOOJS = "mazoo.js"
MAZOOMINJS = "mazoo-minified.js"
SOURCES = Rake::FileList.new("src/*.js")

BUILD = "build"
BUILD_JS = File.join(BUILD, "js")
BUILD_CSS = File.join(BUILD, "css")
BUILD_IMG = File.join(BUILD, "images")
BUILD_HTML = File.join(BUILD, "index.html")

desc "remove generated artifacts"
task :clean do
  rm_rf [MAZOOJS, MAZOOMINJS, "build"]
end

desc "combine all JS files into a single #{MAZOOJS}"
file MAZOOJS => SOURCES do |t|
  sh "cat #{t.prerequisites.join(" ")} > #{t.name}"
end

file MAZOOMINJS => MAZOOJS do |t|
  sh "yuicompressor #{t.prerequisites.first} -o #{t.name}"
end

file BUILD_JS => MAZOOMINJS do |t|
  sh "mkdir -p #{t.name}"
  cp MAZOOMINJS, t.name
end

file BUILD_CSS do |t|
  sh "mkdir -p #{t.name}"
  cp Rake::FileList.new("css/*"), BUILD_CSS
end

file BUILD_IMG do |t|
  sh "mkdir -p #{t.name}"
  cp Rake::FileList.new("images/*"), BUILD_IMG
end

file BUILD_HTML => [BUILD_JS, BUILD_CSS, BUILD_IMG] do |t|
  contents = File.read("game.html").
    sub(/<!--JSSTART-->.*<!--JSEND-->/m, "<script src=\"js/#{MAZOOMINJS}\" type=\"text/javascript\"></script>")

  if File.exists?("_analytics.html")
    contents = contents.sub(/<!--ANALYTICS-->/, File.read("_analytics.html"))
  end

  File.write(t.name, contents)
end

task minify: MAZOOMINJS
task build: BUILD_HTML
