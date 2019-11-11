module Jekyll
    class JupyterGenerator < Generator
        safe true

        def generate(site)
            notebooks = site.static_files.select{|file| file.path =~ /.ipynb$/i}
            notebooks.each do |notebook|
                site.pages << NotebookPage.new(site, site.source, notebook)
            end
            site.static_files = site.static_files - notebooks
        end
    end

    class NotebookPage < Page
        def initialize(site, base, notebook)
            @site = site
            @base = base
            @dir = File.dirname(notebook.path)
            @name = 'index.md'

            title = File.basename(@dir)

            self.process(@name)
            self.read_yaml(File.join(base, '_layouts'), 'page.html')
            self.data['layout'] = 'page'
            self.data['title'] = title
            self.data['permalink'] = "/notebooks/#{title}/"
            self.content = %x[ python3 _plugins/jupyter-convert.py #{notebook.path} ]
        end
    end
end
