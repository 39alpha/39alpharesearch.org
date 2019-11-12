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

            notebooks_dir = File.basename(notebooks_collection.collection_dir)
            site.pages << NotebooksPage.new(site, site.source, notebooks_dir, notebooks_collection)
        end
    end

    class NotebookPage < Page
        YAML_FILE_EXTS = %w(.yaml .yml).freeze

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
            self.data['excerpt'] = Jekyll::Excerpt.new(self)
        end

        def excerpt_separator
            @excerpt_separator ||= (data["excerpt_separator"] || site.config["excerpt_separator"]).to_s
        end

        def yaml_file?
            YAML_FILE_EXTS.include?(extname)
        end
    end

    class NotebookStaticFile < StaticFile
        def destination(dest)
            dest = @site.in_dest_dir(dest)
            @site.in_dest_dir(dest, Jekyll::URL.unescape_path(url).gsub(/^_/, ''))
        end
    end

    class NotebooksPage < Page
        def initialize(site, base, dir, notebooks)
            @site = site
            @base = base
            @dir = dir
            @name = 'index.html'

            self.process(@name)

            self.read_yaml(File.join(base, '_layouts'), 'notebooks_index.html')
            self.data['layout'] = 'notebooks_index'
            self.data['title'] = 'Notebooks'
            self.data['permalink'] = '/notebooks/'
        end
    end
end
