# jekyll-target-blank calls URI.parse on every href. Ruby's URI rejects
# non-ASCII Wikipedia URLs (Skármeta, Pokémon, …). Addressable accepts them.
module Jekyll
  class TargetBlank
    class << self
      def external?(link)
        return unless link&.match?(URI.regexp(%w[http https]))

        Addressable::URI.parse(link).host != Addressable::URI.parse(@site_url).host
      rescue Addressable::URI::InvalidURIError
        false
      end
    end
  end
end
