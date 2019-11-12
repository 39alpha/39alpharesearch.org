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

            self.read_yaml(File.join(base, '_layouts'), 'page.html')
            self.data['layout'] = 'page'
            self.data['title'] = 'Projects'
            self.data['permalink'] = '/projects/'
            self.content = '''
                {% for project in site.projects %}
                    <h2><a href="{{ project.url | relative_url }}">{{ project.title }}</a></h2>
                    <p>{{ project.excerpt }}</p>
                    <ul>
                        <li>Purity: {{ project.purity }}</li>
                        <li>Risk: {{ project.risk }}</li>
                        <li>Reward: {{ project.reward }}</li>
                    <ul>
                {% endfor %}
            '''
        end
    end
end
