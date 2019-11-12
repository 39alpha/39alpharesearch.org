module Jekyll
    class ProjectPageGenerator < Generator
        safe true

        def generate(site)
            projects = site.collections['projects']
            dir = File.basename(projects.collection_dir)
            site.pages << ProjectPage.new(site, site.source, dir, projects)
        end
    end

    class ProjectPage < Page
        def initialize(site, base, dir, projects)
            @site = site
            @base = base
            @dir = dir
            @name = 'index.html'

            self.process(@name)

            self.read_yaml(File.join(base, '_layouts'), 'project_index.html')
            self.data['layout'] = 'project_index'
            self.data['title'] = 'Projects'
            self.data['permalink'] = '/projects/'
        end
    end
end
