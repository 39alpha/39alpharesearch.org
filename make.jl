using Documenter

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

jekyll()
deploy()
