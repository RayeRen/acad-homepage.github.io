# Compatibility shim for Ruby 3.2+ where Object#tainted? was removed.
# Liquid 4.0.3 (bundled with Jekyll 3.9 / github-pages) still calls tainted?,
# so we provide a no-op implementation to avoid NoMethodError.
Jekyll.logger.info "compat", "loading taint/pathutil shim for Ruby >= 3.2" if defined?(Jekyll)

unless Object.new.respond_to?(:tainted?)
  class Object
    def tainted?
      false
    end
  end
end

# Pathutil < 0.17 passes kw hash positionally; Ruby 3.2 treats it as length.
# Patch read/binread to splat keywords so encoding: works.
begin
  require "pathutil"
  Pathutil.class_eval do
    def read(*args, **kwd)
      kwd[:encoding] ||= encoding if respond_to?(:encoding)

      if respond_to?(:normalize) && normalize[:read]
        File.read(self, *args, **kwd).encode({
          :universal_newline => true
        })
      else
        File.read(self, *args, **kwd)
      end
    end

    def binread(*args, **kwd)
      kwd[:encoding] ||= encoding if respond_to?(:encoding)

      if respond_to?(:normalize) && normalize[:read]
        File.binread(self, *args, **kwd).encode({
          :universal_newline => true
        })
      else
        File.binread(self, *args, **kwd)
      end
    end
  end
rescue LoadError
  Jekyll.logger.warn "compat", "pathutil not found; skip read patch" if defined?(Jekyll)
end
