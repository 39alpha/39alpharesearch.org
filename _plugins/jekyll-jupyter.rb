module Jekyll
    class JupyterGenerator < Generator
        safe true

        def generate(site)
            notebooks = site.static_files.select{|file| file.path =~ /.ipynb$/i}
            notebooks.each do |notebook|
                dir = File.join('notebooks', notebook.basename)
                site.pages << NotebookPage.new(site, site.source, dir, notebook)
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
            self.data['permalink'] = "/notebooks/#{notebook.basename}"
            self.content = %x[ python3 _plugins/jupyterconvert.py #{notebook.path} ]
        end
    end
end
