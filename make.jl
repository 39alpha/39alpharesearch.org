using Documenter

baseurl() = "/" * get(ENV, "TRAVIS_TAG", "latest")

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

jekyll() = run(`bundle exec jekyll build`)

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

with_baseurl(jekyll)
deploy()
