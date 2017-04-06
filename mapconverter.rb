#!/usr/bin/env ruby

require 'json'
map = JSON.parse(File.read(ARGV[0]))
map['room']['map'].each do |row|
  row.each do |tile|
    case tile['type']
    when 'grass'
      tile['imageClass'] = 'i-terrain-grassv1'
    when /path/
      tile['imageClass'] = 'i-terrain-roadv1'
    when 'road'
      tile['imageClass'] = 'i-terrain-roadv1'
    when 'dirt'
      tile['imageClass'] = 'i-dirt'
    when 'floor'
      tile['imageClass'] = 'i-floor'
    else
      tile['imageClass'] = 'i-terrain-grassv1'
    end
  end
end

puts map.to_json
