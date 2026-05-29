// SuSy Prototype JavaScript Functionality
document.addEventListener('DOMContentLoaded', function() {
    const assets = getAssets();
    const userInfo = getUserInfo();
    const navigationLinks = getNavigationLinks();

    renderNavLinks(document.getElementById('navLinks'), navigationLinks);
    updateUserInfo(userInfo);
    updateAssetUrls(assets);
    setupSearchQuickActionsTrigger();

    console.log('SuSy Prototype initialized');

    function renderNavLinks(container, links) {
        if (!container) return;
        container.innerHTML = '';
        
        links.forEach(link => {
            if (link.hasDropdown) {
                const dropdownContainer = document.createElement('div');
                dropdownContainer.className = 'nav-link-dropdown';
                
                const navLink = document.createElement('a');
                navLink.href = link.href;
                navLink.className = 'nav-link';
                if (link.target) navLink.target = link.target;
                if (link.target === '_blank') navLink.rel = 'noopener noreferrer';
                navLink.innerHTML = `${link.text} <span class="material-symbols-rounded dropdown-icon">keyboard_arrow_down</span>`;
                
                const dropdownMenu = document.createElement('div');
                dropdownMenu.className = 'nav-dropdown-menu';
                
                if (link.dropdownType === 'grid') {
                    dropdownMenu.classList.add('nav-dropdown-grid');
                    link.dropdownItems.forEach(section => {
                        const sectionDiv = document.createElement('div');
                        sectionDiv.className = 'nav-dropdown-section';
                        const title = document.createElement('div');
                        title.className = 'nav-dropdown-title';
                        title.textContent = section.title;
                        sectionDiv.appendChild(title);
                        const itemsList = document.createElement('ul');
                        section.items.forEach(item => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.href = item.href;
                            a.className = 'nav-dropdown-item';
                            a.textContent = item.text;
                            if (item.target) a.target = item.target;
                            if (item.target === '_blank') a.rel = 'noopener noreferrer';
                            li.appendChild(a);
                            itemsList.appendChild(li);
                        });
                        sectionDiv.appendChild(itemsList);
                        dropdownMenu.appendChild(sectionDiv);
                    });
                } else {
                    const itemsList = document.createElement('ul');
                    link.dropdownItems.forEach(item => {
                        const li = document.createElement('li');
                        const a = document.createElement('a');
                        a.href = item.href;
                        a.className = 'nav-dropdown-item';
                        a.textContent = item.text;
                        if (item.target) a.target = item.target;
                        if (item.target === '_blank') a.rel = 'noopener noreferrer';
                        li.appendChild(a);
                        itemsList.appendChild(li);
                    });
                    dropdownMenu.appendChild(itemsList);
                }
                
                dropdownContainer.appendChild(navLink);
                dropdownContainer.appendChild(dropdownMenu);
                container.appendChild(dropdownContainer);
            } else {
                const navLink = document.createElement('a');
                navLink.href = link.href;
                navLink.className = 'nav-link';
                navLink.textContent = link.text;
                if (link.target) navLink.target = link.target;
                if (link.target === '_blank') navLink.rel = 'noopener noreferrer';
                container.appendChild(navLink);
            }
        });
    }

    function updateUserInfo(userInfo) {
        const userEmailElement = document.querySelector('.user-email');
        if (userEmailElement) {
            userEmailElement.textContent = userInfo.email;
        }
    }

    function updateAssetUrls(assets) {
        const logoImg = document.querySelector('.logo-image img');
        if (logoImg) {
            logoImg.src = assets.logo;
        }
    }

    function setupSearchQuickActionsTrigger() {
        const sidebarTrigger = document.querySelector('.menu-item[data-node-id="menu-search-quick-actions"] .menu-item-content');
        if (sidebarTrigger) {
            sidebarTrigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const triggerInput = document.getElementById('commandSearchTrigger');
                if (triggerInput) {
                    triggerInput.focus();
                    triggerInput.select();
                }
            });
        }
    }
});
