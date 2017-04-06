#!/usr/bin/env ruby

names = ""
css = ""
Dir['./public/images/terrain/*'].each do |subfolder|
  Dir[subfolder + '/*'].each do |imagepath|
    css += ".i-terrain-#{imagepath.split('/').last.split('.').first} {background-image:url('#{imagepath.split("./public/").last}');}\n"
    names += "'i-terrain-#{imagepath.split('/').last.split('.').first}', "
  end
end

puts css

#puts names
