module Jekyll
    class JupyterGenerator < Generator
        safe true

        def generate(site)
            notebooks_collection = site.collections['notebooks']
            notebooks = notebooks_collection.files.select{|file| file.path =~ /.ipynb$/i}
            notebooks.each do |notebook|
                notebooks_collection.docs << NotebookPage.new(site, site.source, notebook)
            end

            notebooks_dir = notebooks_collection.directory
            notebooks_collection.files.each do |file|
                dir = File.dirname(file.relative_path)
                site.static_files << NotebookStaticFile.new(site, site.source, dir, file.name)
            end
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

    class NotebookStaticFile < StaticFile
        def destination(dest)
            dest = @site.in_dest_dir(dest)
            @site.in_dest_dir(dest, Jekyll::URL.unescape_path(url).gsub(/^_/, ''))
        end
    end
end
