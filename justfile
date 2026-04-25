# Portfolio site commands

# Start dev server (installs deps if needed)
start:
    #!/usr/bin/env bash
    [ ! -d node_modules ] && npm install
    npm run dev

# Build the site
build:
    npm run build

# Preview the built site
preview:
    npm run preview

# Create a TIL entry for today (auto-consumes matching Someday topic)
today slug:
    #!/usr/bin/env bash
    year=$(date +%Y)
    month=$(date +%m)
    day=$(date +%Y-%m-%d)
    dir="src/content/til/${year}/${month}"
    file="${dir}/{{slug}}.md"
    mkdir -p "$dir"
    if [ -f "$file" ]; then
        echo "Already exists: $file"
        exit 1
    fi
    someday="src/content/want-to-learn/{{slug}}.md"
    if [ -f "$someday" ]; then
        # Pull frontmatter from the Someday topic
        title=$(grep '^title:' "$someday" | head -1 | sed 's/title: *//')
        desc=$(grep '^description:' "$someday" | head -1 | sed 's/description: *//')
        tag=$(grep '^tag:' "$someday" | head -1 | sed 's/tag: *"\(.*\)"/\1/')
        cat > "$file" << EOF
    ---
    title: ${title}
    date: ${day}
    tags: ["${tag}"]
    description: ${desc}
    ---

    EOF
        sed -i '' 's/^    //' "$file"
        rm "$someday"
        echo "Created: $file"
        echo "Star consumed by the black hole. Fill in the article body!"
    else
        cat > "$file" << 'FRONTMATTER'
    ---
    title: ""
    date: DATEPLACEHOLDER
    tags: []
    description: ""
    ---

    FRONTMATTER
        sed -i '' "s/DATEPLACEHOLDER/${day}/" "$file"
        sed -i '' 's/^    //' "$file"
        echo "Created: $file"
        echo "Open it and fill in the title, tags, and description."
    fi

# Create a Someday topic
someday slug:
    #!/usr/bin/env bash
    file="src/content/want-to-learn/{{slug}}.md"
    if [ -f "$file" ]; then
        echo "Already exists: $file"
        exit 1
    fi
    cat > "$file" << 'EOF'
    ---
    title: ""
    description: ""
    tag: ""
    ---
    EOF
    sed -i '' 's/^    //' "$file"
    echo "Created: $file"

# List all TIL entries
tils:
    #!/usr/bin/env bash
    echo "TIL entries:"
    find src/content/til -name '*.md' | sort -r | while read f; do
        title=$(grep '^title:' "$f" | head -1 | sed 's/title: *"\(.*\)"/\1/')
        date=$(grep '^date:' "$f" | head -1 | sed 's/date: *//')
        echo "  ${date}  ${title}  (${f})"
    done

# List all Someday topics
stars:
    #!/usr/bin/env bash
    echo "Someday topics:"
    find src/content/want-to-learn -name '*.md' | sort | while read f; do
        title=$(grep '^title:' "$f" | head -1 | sed 's/title: *"\(.*\)"/\1/')
        tag=$(grep '^tag:' "$f" | head -1 | sed 's/tag: *"\(.*\)"/\1/')
        echo "  [${tag}]  ${title}  (${f})"
    done

# Deploy (just push to main)
deploy:
    git push origin main
