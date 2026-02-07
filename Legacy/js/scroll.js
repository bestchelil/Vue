document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       基础变量
       ========================= */
    const snapContainer = document.querySelector(".snap-container");
    const menuLinks = document.querySelectorAll(".menu a");
    const sections = document.querySelectorAll(".snap-section");
    const navHeight = 64;

    if (!snapContainer) return;

    /* =========================
       菜单点击滚动
       ========================= */
    menuLinks.forEach(link => {
        link.addEventListener("click", () => {
            const targetId = link.dataset.target;
            const target = document.getElementById(targetId);
            if (!target) return;

            snapContainer.scrollTo({
                top: target.offsetTop - navHeight,
                behavior: "smooth"
            });
        });
    });

    /* =========================
       滚动高亮菜单
       ========================= */
    snapContainer.addEventListener("scroll", () => {
        const scrollTop = snapContainer.scrollTop;

        sections.forEach(section => {
            if (scrollTop >= section.offsetTop - navHeight - 10) {
                menuLinks.forEach(a => a.classList.remove("active"));
                document
                    .querySelector(`.menu a[data-target="${section.id}"]`)
                    ?.classList.add("active");
            }
        });
    });

    /* =========================
       底部滚动提示显示 / 隐藏
       ========================= */
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) {
        snapContainer.addEventListener('scroll', () => {
            const scrollTop = snapContainer.scrollTop;
            const maxScroll = snapContainer.scrollHeight - snapContainer.clientHeight;
            scrollHint.style.opacity = (scrollTop >= maxScroll - 10) ? '0' : '1';
        });
    }


    /* =========================
       角色数据
       ========================= */
    const roleData = [
        {
            name: "战士",
            meta: ["品级：勇者", "标签：爆发"],
            desc: "这是角色一的描述，占位文本。",
            image: "./images/roles/zhanshi.png",
            avatar: "./images/roles/avatar/zhanshi.png"
        },
        {
            name: "术士",
            meta: ["品级：史诗", "标签：控制"],
            desc: "这是角色二的描述，占位文本。",
            image: "./images/roles/shushi.png",
            avatar: "./images/roles/avatar/shushi.png"
        },
        {
            name: "法师",
            meta: ["品级：传说", "标签：持续"],
            desc: "这是角色三的描述，占位文本。",
            image: "./images/roles/fashi.png",
            avatar: "./images/roles/avatar/fashi.png"
        }
    ];

    const roleKeys = ["warrior", "mage", "tao", "assassin"].slice(0, roleData.length);

    const roleVideos = [
        "./videos/roles/zhanshi.mp4",
        "./videos/roles/shushi.mp4",
        "./videos/roles/fashi.mp4",
        "./videos/roles/daozei.mp4"
    ].slice(0, roleData.length);

    let currentRoleIndex = 0;


    /* =========================
       角色切换 DOM
       ========================= */
    const rolesSection = document.getElementById("roles");
    const rolesInfo = document.querySelector(".roles-info");
    const roleName = document.querySelector(".role-name");
    const roleMeta = document.querySelector(".role-meta");
    const roleDesc = document.querySelector(".role-desc");
    const roleImage = document.querySelector(".role-image");

    const rolesSelector = document.getElementById("rolesSelector");

    // ✅ hover 视频（只声明一次）
    const previewBox = document.getElementById("rolePreview");
    const previewVideo = document.getElementById("rolePreviewVideo");

    /* =========================
       1) 自动生成头像泡泡按钮
       ========================= */
    let bubbles = [];

    if (rolesSelector) {
        rolesSelector.innerHTML = "";

        roleData.forEach((role, index) => {
            const btn = document.createElement("button");
            btn.className = "role-bubble" + (index === 0 ? " active" : "");
            btn.dataset.role = index;
            btn.setAttribute("aria-label", role.name);

            btn.innerHTML = `<img src="${role.avatar}" alt="${role.name}">`;

            rolesSelector.appendChild(btn);
        });

        bubbles = Array.from(rolesSelector.querySelectorAll(".role-bubble"));
    }

    function setRole(index) {
        const data = roleData[index];
        if (!data) return;

        currentRoleIndex = index;

        if (bubbles.length) {
            bubbles.forEach(b => b.classList.remove("active"));
            bubbles[index]?.classList.add("active");
        }

        if (rolesSection) {
            rolesSection.classList.remove("role-warrior", "role-mage", "role-tao", "role-assassin");
            rolesSection.classList.add(`role-${roleKeys[index]}`);
        }

        if (roleName) roleName.textContent = data.name;
        if (roleDesc) roleDesc.textContent = data.desc;

        if (roleMeta) {
            roleMeta.innerHTML = "";
            data.meta.forEach(item => {
                const li = document.createElement("li");
                li.textContent = item;
                roleMeta.appendChild(li);
            });
        }

        if (roleImage) {
            roleImage.style.backgroundImage = `url(${data.image})`;
        }

        // ✅ 同步更新 hover 视频 src（不播放）
        if (previewVideo && roleVideos[index]) {
            previewVideo.dataset.src = roleVideos[index];
            previewVideo.src = roleVideos[index];
            previewVideo.load();
        }
    }

    if (rolesSection && rolesInfo && bubbles.length && roleName && roleMeta && roleDesc && roleImage) {
        setRole(0);

        bubbles.forEach(btn => {
            btn.addEventListener("click", () => {
                const index = Number(btn.dataset.role);
                if (!roleData[index]) return;

                rolesInfo.classList.add("is-switching");

                setTimeout(() => {
                    setRole(index);
                    rolesInfo.classList.remove("is-switching");
                }, 350);
            });
        });
    }


    /* =========================
       News 数据驱动：Cover 支持图片/视频 + 淡入淡出
       ========================= */
    const newsData = [
        {
            tag: "活动",
            title: "春节活动开启公告",
            summary: "春节活动正式开启，参与即可领取限定奖励与节日称号。",
            date: "2025-01-10",
            coverType: "image",
            cover: "./images/news/cover1.jpg"
        },
        {
            tag: "实机",
            title: "新角色技能演示（视频）",
            summary: "观看新角色的攻击演示与技能特效，掌握核心打法。",
            date: "2025-01-08",
            coverType: "video",
            cover: "./videos/news/demo1.mp4",
            poster: "./images/news/demo1_poster.jpg"
        },
        {
            tag: "公告",
            title: "防沉迷系统调整通知",
            summary: "根据最新政策要求，对防沉迷规则及实名验证流程进行更新。",
            date: "2024-12-28",
            coverType: "image",
            cover: "./images/news/cover3.jpg"
        }
    ];

    const newsList = document.getElementById("newsList");
    const newsCover = document.getElementById("newsCover");
    const newsCoverImage = document.getElementById("newsCoverImage");
    const newsCoverVideo = document.getElementById("newsCoverVideo");
    const newsContent = document.querySelector(".news-content");

    const featureTag = document.querySelector(".news-tag");
    const featureTitle = document.querySelector(".news-title");
    const featureSummary = document.querySelector(".news-summary");
    const featureDate = document.querySelector(".news-date");

    if (newsList && newsCover && newsCoverImage && newsCoverVideo && featureTag && featureTitle && featureSummary && featureDate) {

        newsList.innerHTML = "";
        newsData.forEach((item, index) => {
            const li = document.createElement("li");
            li.className = "news-item" + (index === 0 ? " active" : "");
            li.dataset.index = index;

            li.innerHTML = `
                <span class="item-tag">${item.tag}</span>
                <span class="item-title">${item.title}</span>
                <time>${item.date.slice(5)}</time>
            `;

            li.addEventListener("click", () => setNews(index));
            newsList.appendChild(li);
        });

        function setNews(index) {
            const item = newsData[index];
            if (!item) return;

            document.querySelectorAll(".news-item").forEach(i => i.classList.remove("active"));
            document.querySelector(`.news-item[data-index="${index}"]`)?.classList.add("active");

            newsCover.classList.add("is-fading");
            newsContent && newsContent.classList.add("is-fading");

            setTimeout(() => {
                featureTag.textContent = item.tag;
                featureTitle.textContent = item.title;
                featureSummary.textContent = item.summary;
                featureDate.textContent = item.date;

                if (item.coverType === "video") {
                    newsCover.classList.add("is-video");

                    if (item.poster) newsCoverVideo.poster = item.poster;
                    else newsCoverVideo.removeAttribute("poster");

                    if (newsCoverVideo.dataset.src !== item.cover) {
                        newsCoverVideo.dataset.src = item.cover;
                        newsCoverVideo.src = item.cover;
                        newsCoverVideo.load();
                    }

                    newsCoverVideo.currentTime = 0;
                    newsCoverVideo.play().catch(() => {});
                } else {
                    newsCover.classList.remove("is-video");
                    newsCoverVideo.pause();
                    newsCoverImage.style.backgroundImage = `url(${item.cover})`;
                }

                requestAnimationFrame(() => {
                    newsCover.classList.remove("is-fading");
                    newsContent && newsContent.classList.remove("is-fading");
                });
            }, 250);
        }

        setNews(0);
    }


    /* =========================
       实机演示：视频播放切换（完整版）
       ========================= */
    const demoThumbs = document.querySelectorAll('.demo-thumb');
    const demoMain = document.querySelector('.demo-main');
    const demoVideo = document.getElementById('demoVideo');

    const demoVideos = [
        "./videos/demo/demo1.mp4",
        "./videos/demo/demo2.mp4",
        "./videos/demo/demo3.mp4",
        "./videos/demo/demo4.mp4"
    ];

    const demoPosters = [
        "./images/demo/demo_poster1.jpg",
        "./images/demo/demo_poster2.jpg",
        "./images/demo/demo_poster3.jpg",
        "./images/demo/demo_poster4.jpg"
    ];

    demoThumbs.forEach((btn, i) => {
        if (demoPosters[i]) btn.style.backgroundImage = `url(${demoPosters[i]})`;
    });

    if (demoThumbs.length && demoMain && demoVideo) {
        setDemoVideo(0, true);

        demoThumbs.forEach(btn => {
            btn.addEventListener('click', () => {
                if (demoMain.classList.contains('is-switching')) return;

                const index = Number(btn.dataset.index);
                if (!demoVideos[index]) return;

                demoThumbs.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                demoMain.classList.add('is-switching');

                setTimeout(() => {
                    setDemoVideo(index);
                    demoMain.classList.remove('is-switching');
                }, 300);
            });
        });
    }

    function setDemoVideo(index, isInit = false) {
        const src = demoVideos[index];
        if (!src) return;

        if (demoPosters[index]) demoVideo.poster = demoPosters[index];

        if (demoVideo.dataset.src !== src) {
            demoVideo.dataset.src = src;
            demoVideo.src = src;
            demoVideo.load();
        }

        if (!isInit) {
            demoVideo.currentTime = 0;
            demoVideo.play().catch(() => {});
        }
    }


    /* =========================
       Wheel 整屏滚动
       ========================= */
    const snapSections = document.querySelectorAll('.snap-section');
    let isScrolling = false;

    snapContainer.addEventListener('wheel', (e) => {
        if (window.innerWidth <= 768) return;

        e.preventDefault();
        if (isScrolling) return;

        const delta = e.deltaY;
        const viewHeight = snapContainer.clientHeight;
        const currentScroll = snapContainer.scrollTop;

        const currentIndex = Math.round(currentScroll / viewHeight);
        let targetIndex = currentIndex;

        if (delta > 0) targetIndex = Math.min(currentIndex + 1, snapSections.length - 1);
        else if (delta < 0) targetIndex = Math.max(currentIndex - 1, 0);

        if (targetIndex === currentIndex) return;

        isScrolling = true;
        snapContainer.scrollTo({ top: targetIndex * viewHeight, behavior: 'smooth' });

        setTimeout(() => { isScrolling = false; }, 700);
    }, { passive: false });


    /* =========================
       查看详情 hover 播放（方案B）
       ========================= */
    const detailWrap =
        document.getElementById("roleDetailWrap") ||
        document.querySelector(".role-detail-btn");

    if (detailWrap && previewBox && previewVideo) {

        const showPreview = () => {
            const src = roleVideos[currentRoleIndex];
            if (!src) return;

            previewBox.classList.add("show");

            if (previewVideo.dataset.src !== src) {
                previewVideo.dataset.src = src;
                previewVideo.src = src;
                previewVideo.load();
            }

            previewVideo.currentTime = 0;
            previewVideo.play().catch(() => {});
        };

        let hideTimer = null;
        const hidePreview = () => {
            hideTimer = setTimeout(() => {
                previewBox.classList.remove("show");
                previewVideo.pause();
            }, 120);
        };

        const cancelHide = () => {
            if (hideTimer) clearTimeout(hideTimer);
        };

        detailWrap.addEventListener("mouseenter", () => {
            cancelHide();
            showPreview();
        });

        detailWrap.addEventListener("mouseleave", hidePreview);

        previewBox.addEventListener("mouseenter", cancelHide);
        previewBox.addEventListener("mouseleave", hidePreview);
    }

});
