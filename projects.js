/* ================================================================
   PROJECTS RENDER ENGINE
   Renders the project items dynamically to #project-list-container
   ================================================================ */

(function renderProjects() {
  const container = document.getElementById('project-list-container');
  if (!container) {
    console.error("[Projects] #project-list-container not found!");
    return;
  }

  if (typeof allProjects === 'undefined') {
    console.error("[Projects] allProjects data is not loaded!");
    return;
  }

  const html = allProjects.map(project => {
    // Generate tag elements
    const tagsHTML = project.tagsList
      .map(tag => `<span class="project-tag">${tag}</span>`)
      .join('\n              ');

    // Customize the Live Demo button's title & icon for video targets
    let demoTitle = "Live Demo";
    let demoIcon = "fas fa-external-link-alt";
    const isYoutube = project.demo && (project.demo.includes("youtube.com") || project.demo.includes("youtu.be"));
    if (isYoutube) {
      demoTitle = "Watch Video";
    }

    // Escape double quotes inside attribute values to prevent HTML syntax break
    const escapedTitle = project.title.replace(/"/g, '&quot;');
    const escapedDesc = project.desc.replace(/"/g, '&quot;');
    const escapedTagsList = project.tagsList.join(',').replace(/"/g, '&quot;');

    return `
        <!-- Project ${project.num} -->
        <div class="project-item" data-tags="${project.tags}" data-aos-project data-num="${project.num}" data-title="${escapedTitle}"
          data-desc="${escapedDesc}"
          data-img="${project.img}" data-tags-list="${escapedTagsList}"
          data-github="${project.github}" data-demo="${project.demo}">
          <span class="project-num">${project.num}</span>
          <div class="project-info">
            <span class="project-name">${project.title}</span>
            <div class="project-meta">
              <span class="project-desc">${project.shortDesc}</span>
            </div>
            <div class="project-meta" style="margin-top:8px">
              ${tagsHTML}
            </div>
            <div class="project-meta" style="margin-top:10px">
              <span class="project-click-hint">Click để xem chi tiết</span>
            </div>
          </div>
          <div class="project-right">
            <img class="project-thumb" src="${project.img}" alt="${escapedTitle}">
            <div class="project-links-row">
              <a href="${project.github}" target="_blank" class="project-link-btn" title="GitHub"
                onclick="event.stopPropagation()">
                <i class="fab fa-github"></i>
              </a>
              <a href="${project.demo}" target="_blank" class="project-link-btn" title="${demoTitle}" onclick="event.stopPropagation()">
                <i class="${demoIcon}"></i>
              </a>
            </div>
          </div>
        </div>`;
  }).join('\n');

  container.innerHTML = html;
})();
