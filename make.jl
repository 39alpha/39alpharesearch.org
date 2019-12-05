using Documenter, PyCall

const nbconvert = pyimport("nbconvert")

baseurl() = let tag = get(ENV, "TRAVIS_TAG", "")
    isempty(tag) ? "/latest" : "/" * tag
end

function with_baseurl(func, baseurl=baseurl())
    jekyll_config = joinpath(@__DIR__, "_config.yml")
    lines = readlines(jekyll_config, keep=true)
    open(jekyll_config, "w+") do f
        for line in lines
            if startswith(line, "baseurl:")
                write(f, "baseurl: \"$(baseurl)\"\n")
                continue
            end
            write(f, line)
        end
    end
    ret = func()
    open(jekyll_config, "w+") do f
        for line in lines
            write(f, line)
        end
    end
    return ret
end

jekyll() = run(`bundle exec jekyll build --trace`)

function deploy()
    devurl = "dev"
    repo = "github.com:39alpha/39alpha.github.io.git"
    deploydocs(
        target = "_site",
        repo = repo,
        branch = "master",
        devbranch = "staging",
        devurl = devurl,
        versions = ["stable" => "v^", "v#.#", devurl => devurl]
    )
end

function extract_from_notebook(filename, outdir=dirname(filename))
    @info "Extracting resources from $filename"
    resourcepaths = []

    _, resources = nbconvert.MarkdownExporter().from_filename(filename)
    if haskey(resources, "outputs")
        for (resource, data) in resources["outputs"]
            resourcepath = joinpath(outdir, resource)
            @info "Extracting $filename:$resource to $resourcepath"
            open(io -> write(io, data), resourcepath, "w")
            push!(resourcepaths, resourcepath)
        end
    end

    resourcepaths
end

function extract_from_notebooks(notebooksdir="_notebooks")
    if ispath(notebooksdir)
        resources = []
        for (root, _, files) in walkdir(notebooksdir), file in files
            filename = joinpath(root, file)
            if occursin(r".*\.ipynb$", file)
                append!(resources, extract_from_notebook(filename))
            end
        end
        resources
    end
end

const resources = extract_from_notebooks()

with_baseurl(jekyll)
deploy()
