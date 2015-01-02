#!/usr/bin/env ruby

require 'bundler/setup'
require 'thor'
require 'json'
require 'shellwords'
require 'active_support/all'

CLUBS = 'https://web.fulcrumapp.com/shares/82982e4c55707a34.geojson'
TOGEOTIFF = '/Users/coleman/Dropbox/dev/togeotiff/togeotiff.rb'

class Clubs < Thor

  desc "leagues", "Show a list of leagues"
  def leagues
    file = JSON.parse(`curl -s https://web.fulcrumapp.com/shares/82982e4c55707a34.geojson`)
    full_list = []
    file["features"].each do |l|
      league = l["properties"]["league"]
      full_list << league
    end
    leagues = full_list.uniq.sort
    puts leagues
  end

  desc "stadia", "Generate image of football ground"
  def stadia
    file = JSON.parse(`curl -s #{CLUBS}`)
    file["features"].each do |l|
      name = l["properties"]["name"]
      slug = name.parameterize
      league = l["properties"]["league"]
      lat = l["geometry"]["coordinates"][1]
      lon = l["geometry"]["coordinates"][0]
      meters = meters_per_degree_at_latitude(lat)
      y = lat2y(lat)
      x = lon2x(lon)
      offset = 300
      north = y2lat(y + offset)
      south = y2lat(y - offset)
      east  = x2lon(x + offset)
      west  = x2lon(x - offset)

      geojson = {
        type: "FeatureCollection",
        features: [
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [
                  west,
                  south
                ],
                [
                  west,
                  north
                ],
                [
                  east,
                  north
                ],
                [
                  east,
                  south
                ],
                [
                  west,
                  south
                ]
              ]
            ]
          }
        ]
      }

      cmd = "#{TOGEOTIFF} image --format jpg --geojson \'#{geojson.to_json}\' --zoom 18 --output \"~/Desktop/Clubs/#{slug}.jpg\""
      # puts cmd
      system(cmd)
    end
  end

  no_tasks do
    def meters_per_degree_at_latitude(latitude)
      radians = latitude * Math::PI / 180
      111132.92 - 559.82 * Math.cos(2 * radians) + 1.175 * Math.cos(4 * radians)
    end

    def to_degrees(angle)
      angle * (180 / Math::PI)
    end

    def to_radians(angle)
      angle * (Math::PI / 180)
    end

    def lon2x(lon)
      to_radians(lon) * 6378137.0
    end

    def lat2y(lat)
      Math.log(Math.tan((Math::PI / 4) + to_radians(lat) / 2.0)) * 6378137.0
    end

    def x2lon(x)
      to_degrees(x / 6378137.0)
    end

    def y2lat(y)
      to_degrees(2.0 * Math.atan(Math.exp(y / 6378137.0)) - (Math::PI / 2))
    end
  end

end

Clubs.start
