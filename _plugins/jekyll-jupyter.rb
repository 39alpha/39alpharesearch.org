module Jekyll
    class JupyterGenerator < Generator
        safe true

        def generate(site)
            notebooks = site.static_files.select{|file| file.path =~ /.ipynb$/i}
            notebooks.each do |notebook|
                dir = File.join('notebooks', notebook.basename)
                site.pages << NotebookPage.new(site, site.source, dir, notebook)
                resources = %x[ python3 _plugins/jupyter-extract.py #{notebook.path} ]
                resources.split(/\r?\n/).each do |resource|
                    site.static_files << TemporaryFile.new(site, site.source, dir, resource)
                end
            end
            site.static_files = site.static_files - notebooks
        end
    end

    class NotebookPage < Page
        def initialize(site, base, dir, notebook)
            @site = site
            @base = base
            @dir = dir
            @name = 'index.md'

            self.process(@name)
            self.read_yaml(File.join(base, '_layouts'), 'page.html')
            self.data['layout'] = 'page'
            self.data['title'] = notebook.basename
            self.data['permalink'] = "/notebooks/#{notebook.basename}/"
            self.content = %x[ python3 _plugins/jupyter-convert.py #{notebook.path} ]
        end
    end

    class TemporaryFile < StaticFile
        def initialize(site, base, dir, filename)
            super(site, base, dir, File.basename(filename))

            ObjectSpace.define_finalizer(self, proc { File.delete(filename) })
        end
    end
end
