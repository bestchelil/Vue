document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     0) 性能优化：资源懒加载/预加载
     - 图片：进入视口再加载（减少首屏请求）
     - 视频：仅在需要播放时加载（你已用 preload="none"）
     ========================= */
  const supportsIO = "IntersectionObserver" in window;

  // 懒加载：把 background-image 的 url(...) 延迟到进入视口再设置
  const lazyBgQueue = [];
  const lazyBg = (el, url) => {
    if (!el || !url) return;
    // 已有背景则不处理
    if (el.dataset.bgLoaded === "1") return;
    el.dataset.bg = url;
    lazyBgQueue.push(el);
  };

  const applyBg = (el) => {
    if (!el || el.dataset.bgLoaded === "1") return;
    const url = el.dataset.bg;
    if (!url) return;
    // 预解码更快（可选）
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    img.onload = () => {
      el.style.backgroundImage = `url(${url})`;
      el.dataset.bgLoaded = "1";
    };
  };

  const observeLazyBgs = () => {
    if (!supportsIO || !lazyBgQueue.length) {
      lazyBgQueue.forEach(applyBg);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        applyBg(e.target);
        io.unobserve(e.target);
      });
    }, { root: null, threshold: 0.12, rootMargin: "120px 0px" });

    lazyBgQueue.forEach((el) => io.observe(el));
  };

  // 预加载：用于切换体验（如下一段 demo poster）
  const preloadImage = (url) => {
    if (!url) return;
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";
    img.src = url;
  };

  /* =========================
     1) 开始游戏跳转
     ========================= */
  const startUrl =
      "https://ml.996box.com/biyingjj?msclkid=cf4201ede6d6174d46e468a681e46b5a";
  const goToStartPage = () => {
    window.location.href = startUrl;
  };

  ["btnStart", "btnStart1", "btnStartFab"].forEach((id) => {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("click", goToStartPage);
  });

  /* =========================
     2) 顶部抽屉菜单（手机）
     ========================= */
  const navToggle = document.getElementById("navToggle");
  const drawerMask = document.getElementById("drawerMask");

  const openMenu = () => {
    document.body.classList.add("menu-open");
    // ✅ 抽屉打开时锁住背景滚动
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    // ✅ 恢复滚动
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };

  const toggleMenu = () => {
    if (document.body.classList.contains("menu-open")) closeMenu();
    else openMenu();
  };

  if (navToggle) navToggle.addEventListener("click", toggleMenu);
  if (drawerMask) drawerMask.addEventListener("click", closeMenu);

  // ✅ ESC 关闭抽屉
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  /* =========================
     3) 导航滚动（Drawer Menu 点击跳转 + 自动高亮）
     ========================= */
  const topNav = document.querySelector(".top-nav");

  const getNavOffset = () => {
    const h = topNav ? topNav.offsetHeight : 56;
    return Math.max(44, h) + 10;
  };

  // ✅ 节流：避免连续点击造成抖动
  let isScrolling = false;

  // ✅ 关键修复：先 closeMenu 释放 overflow，再滚动（iOS/安卓都稳定）
  const scrollToSection = (targetId) => {
    if (!targetId || isScrolling) return;

    const el = document.getElementById(targetId);
    if (!el) return;

    isScrolling = true;

    // ✅ 先关闭菜单，释放页面滚动（否则 iOS 上 scrollTo 不生效）
    closeMenu();

    // ✅ 等一帧，确保 layout 更新后再滚动
    requestAnimationFrame(() => {
      const y =
          el.getBoundingClientRect().top +
          window.pageYOffset -
          getNavOffset();

      window.scrollTo({
        top: Math.max(0, y),
        behavior: "smooth",
      });

      setTimeout(() => {
        isScrolling = false;
      }, 520);
    });
  };

  const menuLinks = Array.from(
      document.querySelectorAll(".menu a[data-target], .drawer a[data-target]")
  );

  menuLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const id = a.dataset.target;

      // 点击当前已激活项：仅关闭菜单
      if (a.classList.contains("active")) {
        closeMenu();
        return;
      }

      scrollToSection(id);
    });
  });

  const setActiveNav = (id) => {
    menuLinks.forEach((a) =>
        a.classList.toggle("active", a.dataset.target === id)
    );
  };

  // ✅ 滚动高亮（IntersectionObserver）
  const sections = Array.from(document.querySelectorAll("section[id]"));

  if ("IntersectionObserver" in window && sections.length) {
    const io = new IntersectionObserver(
        (entries) => {
          const visible = entries
              .filter((e) => e.isIntersecting)
              .sort(
                  (a, b) =>
                      (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
              )[0];

          if (visible?.target?.id) setActiveNav(visible.target.id);
        },
        {
          threshold: [0.45, 0.6, 0.75],
          rootMargin: "-15% 0px -55% 0px",
        }
    );

    sections.forEach((s) => io.observe(s));
  } else {
    // fallback
    window.addEventListener(
        "scroll",
        () => {
          const scrollTop =
              window.scrollY || document.documentElement.scrollTop;

          let currentId = sections[0]?.id || "home";

          sections.forEach((sec) => {
            const top = sec.offsetTop - getNavOffset() - 10;
            if (scrollTop >= top) currentId = sec.id;
          });

          setActiveNav(currentId);
        },
        { passive: true }
    );
  }

  /* =========================
     4) 角色：数据驱动 + 头像切换
     ========================= */
  const roleData = [
    {
      name: "战士",
      meta: ["品级：勇者", "标签：爆发"],
      desc: "这是角色一的描述，占位文本。",
      image: "./images/roles/zhanshi.png",
      avatar: "./images/roles/avatar/zhanshi.png",
    },
    {
      name: "术士",
      meta: ["品级：史诗", "标签：控制"],
      desc: "这是角色二的描述，占位文本。",
      image: "./images/roles/shushi.png",
      avatar: "./images/roles/avatar/shushi.png",
    },
    {
      name: "法师",
      meta: ["品级：传说", "标签：持续"],
      desc: "这是角色三的描述，占位文本。",
      image: "./images/roles/fashi.png",
      avatar: "./images/roles/avatar/fashi.png",
    },
  ];

  const roleVideos = [
    "./videos/roles/zhanshi.mp4",
    "./videos/roles/shushi.mp4",
    "./videos/roles/fashi.mp4",
  ];

  let currentRoleIndex = 0;

  const roleName = document.querySelector(".role-name");
  const roleMeta = document.querySelector(".role-meta");
  const roleDesc = document.querySelector(".role-desc");
  const roleImage = document.querySelector(".role-image");

  const rolesSelector = document.getElementById("rolesSelector");
  const roleDetailBtn =
      document.getElementById("roleDetailBtn") ||
      document.querySelector(".role-detail-btn");

  const previewBox = document.getElementById("rolePreview");
  const previewVideo = document.getElementById("rolePreviewVideo");
  const previewClose = document.getElementById("previewClose");
  const modalMask = document.getElementById("modalMask");

  let bubbles = [];

  if (rolesSelector) {
    rolesSelector.innerHTML = "";
    roleData.forEach((role, index) => {
      const btn = document.createElement("button");
      btn.className = "role-bubble" + (index === 0 ? " active" : "");
      btn.dataset.role = String(index);
      btn.setAttribute("aria-label", role.name);
      btn.innerHTML = `<img src="${role.avatar}" alt="${role.name}">`;
      rolesSelector.appendChild(btn);
    });

    bubbles = Array.from(rolesSelector.querySelectorAll(".role-bubble"));
  }

  const setRole = (index) => {
    const data = roleData[index];
    if (!data) return;

    currentRoleIndex = index;

    bubbles.forEach((b) =>
        b.classList.toggle("active", Number(b.dataset.role) === index)
    );

    if (roleName) roleName.textContent = data.name;

    if (roleMeta) {
      roleMeta.innerHTML = "";
      data.meta.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        roleMeta.appendChild(li);
      });
    }

    if (roleDesc) roleDesc.textContent = data.desc;
    if (roleImage) {
      lazyBg(roleImage, data.image);
      // 若当前已在视口内，立即加载（避免切换时空白）
      applyBg(roleImage);
    }

    // 同步预览视频（不自动弹出）
    const v = roleVideos[index];
    if (previewVideo && v) {
      previewVideo.dataset.src = v;
      previewVideo.src = v;
      previewVideo.load();
    }
  };

  if (bubbles.length) {
    bubbles.forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.role);
        if (!Number.isFinite(index)) return;
        setRole(index);
      });
    });
  }

  setRole(0);
  // ✅ 启动背景图懒加载观察
  observeLazyBgs();

  /* =========================
     角色预览：手机端“点击打开/关闭”
     ========================= */
  const openPreview = () => {
    const v = roleVideos[currentRoleIndex];
    if (!previewBox || !previewVideo || !v) return;

    if (modalMask) modalMask.classList.add("show");
    previewBox.classList.add("show");
    previewBox.setAttribute("aria-hidden", "false");

    if (previewVideo.dataset.src !== v) {
      previewVideo.dataset.src = v;
      previewVideo.src = v;
      previewVideo.load();
    }

    previewVideo.currentTime = 0;
    previewVideo.play().catch(() => {});
  };

  const closePreview = () => {
    if (!previewBox || !previewVideo) return;

    previewBox.classList.remove("show");
    previewBox.setAttribute("aria-hidden", "true");
    if (modalMask) modalMask.classList.remove("show");

    previewVideo.pause();
  };

  const togglePreview = () => {
    if (!previewBox) return;
    if (previewBox.classList.contains("show")) closePreview();
    else openPreview();
  };

  if (roleDetailBtn) roleDetailBtn.addEventListener("click", togglePreview);
  if (previewClose) previewClose.addEventListener("click", closePreview);
  if (modalMask) modalMask.addEventListener("click", closePreview);

  /* =========================
     5) 资讯：图片/视频 Cover 切换
     ========================= */
  const newsData = [
    {
      tag: "活动",
      title: "春节活动开启公告",
      summary: "春节活动正式开启，参与即可领取限定奖励与节日称号。",
      date: "2025-01-10",
      coverType: "image",
      cover: "./images/news/cover1.jpg",
    },
    {
      tag: "实机",
      title: "新角色技能演示（视频）",
      summary: "观看新角色的攻击演示与技能特效，掌握核心打法。",
      date: "2025-01-08",
      coverType: "video",
      cover: "./videos/news/demo1.mp4",
      poster: "./images/news/demo1_poster.jpg",
    },
    {
      tag: "公告",
      title: "防沉迷系统调整通知",
      summary: "根据最新政策要求，对防沉迷规则及实名验证流程进行更新。",
      date: "2024-12-28",
      coverType: "image",
      cover: "./images/news/cover3.jpg",
    },
  ];

  const newsList = document.getElementById("newsList");
  const newsCover = document.getElementById("newsCover");
  const newsCoverImage = document.getElementById("newsCoverImage");
  const newsCoverVideo = document.getElementById("newsCoverVideo");

  const featureTag = document.querySelector(".news-tag");
  const featureTitle = document.querySelector(".news-title");
  const featureSummary = document.querySelector(".news-summary");
  const featureDate = document.querySelector(".news-date");

  const setNews = (index) => {
    const item = newsData[index];
    if (!item) return;

    document.querySelectorAll(".news-item").forEach((i) =>
        i.classList.remove("active")
    );
    document
        .querySelector(`.news-item[data-index="${index}"]`)
        ?.classList.add("active");

    if (featureTag) featureTag.textContent = item.tag;
    if (featureTitle) featureTitle.textContent = item.title;
    if (featureSummary) featureSummary.textContent = item.summary;
    if (featureDate) featureDate.textContent = item.date;

    if (newsCover && newsCoverImage && newsCoverVideo) {
      if (item.coverType === "video") {
        newsCover.classList.add("is-video");
        if (item.poster) newsCoverVideo.poster = item.poster;

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
        preloadImage(item.cover);
        newsCoverImage.style.backgroundImage = `url(${item.cover})`;
      }
    }
  };

  if (newsList && newsCover && newsCoverImage && newsCoverVideo) {
    newsList.innerHTML = "";
    newsData.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = "news-item" + (index === 0 ? " active" : "");
      li.dataset.index = String(index);

      li.innerHTML = `
        <span class="item-tag">${item.tag}</span>
        <span class="item-title">${item.title}</span>
        <time>${item.date.slice(5)}</time>
      `;

      li.addEventListener("click", () => setNews(index));
      newsList.appendChild(li);
    });

    setNews(0);
  }

  /* =========================
     6) 实机演示：视频切换
     ========================= */
  const demoThumbs = Array.from(document.querySelectorAll(".demo-thumb"));
  const demoVideo = document.getElementById("demoVideo");

  const demoVideos = [
    "./videos/demo/demo1.mp4",
    "./videos/demo/demo2.mp4",
    "./videos/demo/demo3.mp4",
    "./videos/demo/demo4.mp4",
  ];

  const demoPosters = [
    "./images/demo/demo_poster1.jpg",
    "./images/demo/demo_poster2.jpg",
    "./images/demo/demo_poster3.jpg",
    "./images/demo/demo_poster4.jpg",
  ];

  demoThumbs.forEach((btn, i) => {
    if (demoPosters[i]) lazyBg(btn, demoPosters[i]);
  });
  // ✅ 预加载首个 poster，避免首次播放前黑屏
  preloadImage(demoPosters[0]);


  const setDemoVideo = (index, isInit = false) => {
    const src = demoVideos[index];
    if (!demoVideo || !src) return;

    if (demoPosters[index]) demoVideo.poster = demoPosters[index];

    // ✅ 预加载下一张 poster（提升切换体验）
    preloadImage(demoPosters[index + 1]);
    preloadImage(demoPosters[index - 1]);

    if (demoVideo.dataset.src !== src) {
      demoVideo.dataset.src = src;
      demoVideo.src = src;
      demoVideo.load();
    }

    // 移动端通常需要用户手势才能播放，这里只在切换时尝试
    if (!isInit) {
      demoVideo.currentTime = 0;
      demoVideo.play().catch(() => {});
    }
  };

  if (demoThumbs.length && demoVideo) {
    setDemoVideo(0, true);

    demoThumbs.forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = Number(btn.dataset.index);
        if (!Number.isFinite(index)) return;

        demoThumbs.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        setDemoVideo(index);
      });
    });
  }
});