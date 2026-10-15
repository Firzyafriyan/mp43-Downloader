/**
 * MP43 Downloader - Client Logic & Interactivity
 * Real-Time Progress Tracking connected to server.py
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const inputUrl = document.getElementById('input-yt-url');
  const btnPaste = document.getElementById('btn-paste-url');
  const btnClear = document.getElementById('btn-clear-url');
  const inputFeedback = document.getElementById('input-feedback');

  const previewCard = document.getElementById('video-preview-card');
  const previewThumb = document.getElementById('preview-thumb-img');
  const previewTitle = document.getElementById('preview-title');
  const previewChannel = document.getElementById('preview-channel-name');
  const previewIdBadge = document.getElementById('preview-id-badge');

  const tabMp4 = document.getElementById('tab-mp4');
  const tabMp3 = document.getElementById('tab-mp3');
  const formatDisplay = document.getElementById('selected-format-display');
  const qualityChipsContainer = document.getElementById('quality-chips-container');

  const btnStartDownload = document.getElementById('btn-start-download');
  const btnDownloadText = document.getElementById('btn-download-text');

  const progressPanel = document.getElementById('progress-panel');
  const progressBarFill = document.getElementById('progress-bar-fill');
  const progressPercent = document.getElementById('progress-percent');
  const progressLabel = document.getElementById('progress-label');

  const step1 = document.getElementById('step-1');
  const step2 = document.getElementById('step-2');
  const step3 = document.getElementById('step-3');
  const step4 = document.getElementById('step-4');

  const downloadReadyBox = document.getElementById('download-ready-box');
  const readyFormatLabel = document.getElementById('ready-format-label');
  const readyDescText = document.getElementById('ready-desc-text');
  const btnTriggerFileDownload = document.getElementById('btn-trigger-file-download');
  const btnDownloadAnother = document.getElementById('btn-download-another');

  // Modal Settings
  const btnOpenSettings = document.getElementById('btn-open-settings');
  const modalSettings = document.getElementById('modal-settings');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnCancelModal = document.getElementById('btn-cancel-modal');
  const btnSaveSettings = document.getElementById('btn-save-settings');
  const inputApiEndpoint = document.getElementById('input-api-endpoint');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // --- State ---
  let currentFormat = 'mp4'; // 'mp4' or 'mp3'
  let currentQuality = '720p'; // default quality
  let currentVideoId = null;
  let currentVideoInfo = {
    title: 'YouTube Video',
    author: 'Channel',
    thumbnail: '',
    id: ''
  };
  let isConverting = false;
  let preparedDownloadUrl = null;
  let preparedFileName = '';
  let progressPollingTimer = null;

  // Quality presets
  const qualityPresets = {
    mp4: [
      { id: '1080p', label: '1080p (Full HD)', desc: 'Kualitas Tertinggi', badge: 'Terbaik' },
      { id: '720p', label: '720p (HD)', desc: 'Cepat & Jernih', badge: 'Rekomendasi' },
      { id: '480p', label: '480p (SD)', desc: 'Standar Cepat', badge: 'Cepat' },
      { id: '360p', label: '360p (Hemat)', desc: 'Ukuran Ringan', badge: 'Hemat' }
    ],
    mp3: [
      { id: '320k', label: '320 kbps (HQ)', desc: 'Audio Studio Ultra Jernih', badge: 'Terbaik' },
      { id: '256k', label: '256 kbps', desc: 'Kualitas Tinggi', badge: 'Populer' },
      { id: '192k', label: '192 kbps', desc: 'Standar Bagus', badge: 'Seimbang' },
      { id: '128k', label: '128 kbps', desc: 'Audio Ringan', badge: 'Kecil' }
    ]
  };

  // --- Initial Setup ---
  loadSettings();
  renderQualityChips();
  setupEventListeners();

  // --- YouTube URL Extraction & Parser ---
  function extractYouTubeId(url) {
    if (!url) return null;
    const cleanUrl = url.trim();

    const regExp = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|v\/|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = cleanUrl.match(regExp);

    return match ? match[1] : null;
  }

  // --- Fetch Video Metadata (oEmbed) ---
  let debounceTimer = null;
  function handleUrlChange() {
    const url = inputUrl.value.trim();

    if (url.length > 0) {
      btnClear.style.display = 'inline-flex';
    } else {
      btnClear.style.display = 'none';
      hidePreview();
      setFeedback('', '');
      return;
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      setFeedback('Format URL YouTube tidak valid. Mohon periksa kembali link Anda.', 'error');
      hidePreview();
      return;
    }

    currentVideoId = videoId;
    setFeedback('Mendeteksi video YouTube...', 'loading');

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchVideoMetadata(url, videoId);
    }, 350);
  }

  async function fetchVideoMetadata(rawUrl, videoId) {
    const defaultThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    currentVideoInfo = {
      id: videoId,
      title: `YouTube Video (${videoId})`,
      author: 'YouTube Creator',
      thumbnail: defaultThumb
    };

    try {
      const oembedUrl = `https://noembed.com/embed?url=${encodeURIComponent(rawUrl)}`;
      const response = await fetch(oembedUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.title) {
          currentVideoInfo.title = data.title;
          currentVideoInfo.author = data.author_name || 'YouTube Creator';
          currentVideoInfo.thumbnail = data.thumbnail_url || defaultThumb;
        }
      }
    } catch (e) {
      console.warn('oEmbed fetch error:', e);
    }

    displayPreview(currentVideoInfo);
    setFeedback('✓ Video YouTube berhasil diverifikasi!', 'success');
  }

  function displayPreview(info) {
    previewTitle.textContent = info.title;
    previewChannel.textContent = info.author;
    previewIdBadge.textContent = `ID: ${info.id}`;

    const imgTest = new Image();
    const maxResUrl = `https://img.youtube.com/vi/${info.id}/maxresdefault.jpg`;
    const hqUrl = `https://img.youtube.com/vi/${info.id}/hqdefault.jpg`;

    imgTest.onload = () => {
      previewThumb.src = (imgTest.naturalWidth > 120) ? maxResUrl : hqUrl;
    };
    imgTest.onerror = () => {
      previewThumb.src = hqUrl;
    };
    imgTest.src = maxResUrl;

    previewCard.style.display = 'flex';
  }

  function hidePreview() {
    previewCard.style.display = 'none';
    currentVideoId = null;
  }

  function setFeedback(message, type) {
    inputFeedback.textContent = message;
    inputFeedback.className = `input-feedback ${type}`;
  }

  // --- Render Quality Selection ---
  function renderQualityChips() {
    qualityChipsContainer.innerHTML = '';
    const presets = qualityPresets[currentFormat];

    presets.forEach((preset) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `quality-chip ${preset.id === currentQuality ? 'active' : ''}`;
      chip.innerHTML = `
        <div class="quality-title">
          <span>${preset.label}</span>
          ${preset.badge ? `<span class="quality-badge-badge">${preset.badge}</span>` : ''}
        </div>
        <div class="quality-desc">${preset.desc}</div>
      `;

      chip.addEventListener('click', () => {
        document.querySelectorAll('.quality-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentQuality = preset.id;
        updateFormatDisplay();
      });

      qualityChipsContainer.appendChild(chip);
    });

    updateFormatDisplay();
  }

  function updateFormatDisplay() {
    const formatName = currentFormat.toUpperCase();
    const presetObj = qualityPresets[currentFormat].find(p => p.id === currentQuality);
    const qualityLabel = presetObj ? presetObj.label : currentQuality;
    formatDisplay.textContent = `${formatName} - ${qualityLabel}`;
    btnDownloadText.textContent = `Mulai Download ${formatName} (${currentQuality})`;
  }

  // --- Format Tab Switcher ---
  tabMp4.addEventListener('click', () => {
    if (currentFormat === 'mp4') return;
    currentFormat = 'mp4';
    currentQuality = '720p';
    tabMp4.classList.add('active');
    tabMp3.classList.remove('active');
    renderQualityChips();
  });

  tabMp3.addEventListener('click', () => {
    if (currentFormat === 'mp3') return;
    currentFormat = 'mp3';
    currentQuality = '320k';
    tabMp3.classList.add('active');
    tabMp4.classList.remove('active');
    renderQualityChips();
  });

  // --- Clipboard Integration ---
  btnPaste.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          inputUrl.value = text.trim();
          handleUrlChange();
          showToast('Tautan berhasil ditempel dari clipboard!', 'success');
        } else {
          showToast('Clipboard Anda kosong.', 'info');
        }
      } else {
        inputUrl.focus();
        showToast('Silakan tekan Ctrl+V untuk menempel tautan.', 'info');
      }
    } catch (err) {
      console.warn('Clipboard access error:', err);
      inputUrl.focus();
      showToast('Tekan Ctrl+V untuk menempel tautan.', 'info');
    }
  });

  btnClear.addEventListener('click', () => {
    inputUrl.value = '';
    handleUrlChange();
    inputUrl.focus();
  });

  inputUrl.addEventListener('input', handleUrlChange);

  // --- Quick Example Tags ---
  document.querySelectorAll('.example-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const url = tag.getAttribute('data-url');
      inputUrl.value = url;
      handleUrlChange();
      showToast(`Memuat contoh: ${tag.textContent}`, 'info');
    });
  });

  // --- Download & Conversion Flow with Live Progress ---
  btnStartDownload.addEventListener('click', () => {
    const url = inputUrl.value.trim();
    const videoId = extractYouTubeId(url);

    if (!videoId) {
      setFeedback('Mohon tempel tautan video YouTube yang valid sebelum mengunduh.', 'error');
      inputUrl.focus();
      showToast('Masukkan link YouTube terlebih dahulu!', 'error');
      return;
    }

    startConversionProcess();
  });

  async function startConversionProcess() {
    if (isConverting) return;
    isConverting = true;

    btnStartDownload.disabled = true;
    progressPanel.style.display = 'block';
    downloadReadyBox.style.display = 'none';

    resetSteps();
    setStepActive(step1);
    updateProgress(3, 'Mengirim perintah ke server pengunduh...');

    const baseUrl = (window.location.port === '5000') 
      ? '' 
      : 'http://localhost:5000';

    try {
      // 1. Request task initiation
      const startRes = await fetch(`${baseUrl}/api/start-download`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: inputUrl.value.trim(),
          format: currentFormat,
          quality: currentQuality,
          title: currentVideoInfo.title
        })
      });

      if (!startRes.ok) {
        const errJson = await startRes.json().catch(() => ({}));
        throw new Error(errJson.error || 'Gagal memulai unduhan di server.');
      }

      const { taskId } = await startRes.json();
      setStepDone(step1);
      setStepActive(step2);

      // 2. Poll progress in real-time
      if (progressPollingTimer) clearInterval(progressPollingTimer);

      progressPollingTimer = setInterval(async () => {
        try {
          const progRes = await fetch(`${baseUrl}/api/progress?taskId=${taskId}`);
          if (!progRes.ok) return;

          const data = await progRes.json();

          if (data.status === 'downloading') {
            setStepDone(step1);
            setStepActive(step2);
            updateProgress(data.percent || 15, data.message || 'Mengunduh stream dari YouTube...');
          } else if (data.status === 'processing') {
            setStepDone(step2);
            setStepActive(step3);
            updateProgress(data.percent || 95, data.message || 'Menggabungkan media via FFmpeg...');
          } else if (data.status === 'ready') {
            clearInterval(progressPollingTimer);
            setStepDone(step3);
            setStepDone(step4);
            updateProgress(100, 'Selesai 100%!');

            const downloadUrl = `${baseUrl}/api/file?taskId=${taskId}`;
            setTimeout(() => {
              finishConversion(downloadUrl, data.filename);
            }, 300);

          } else if (data.status === 'error') {
            clearInterval(progressPollingTimer);
            throw new Error(data.error || 'Terjadi kesalahan saat memproses media.');
          }
        } catch (pollErr) {
          clearInterval(progressPollingTimer);
          handleDownloadError(pollErr);
        }
      }, 500);

    } catch (err) {
      handleDownloadError(err);
    }
  }

  function handleDownloadError(err) {
    console.error('Download error:', err);
    if (progressPollingTimer) clearInterval(progressPollingTimer);
    isConverting = false;
    btnStartDownload.disabled = false;
    progressPanel.style.display = 'none';

    showToast(err.message, 'error');
    alert(`⚠️ Kendala Unduhan:\n\n${err.message}\n\nPastikan koneksi internet stabil.`);
  }

  function updateProgress(percent, label) {
    const clamped = Math.min(100, Math.max(0, percent));
    progressBarFill.style.width = `${clamped}%`;
    progressPercent.textContent = `${clamped}%`;
    if (label) progressLabel.textContent = label;
  }

  function resetSteps() {
    [step1, step2, step3, step4].forEach(step => {
      step.className = 'step-item';
    });
  }

  function setStepActive(step) {
    step.className = 'step-item active';
  }

  function setStepDone(step) {
    step.className = 'step-item done';
  }

  function finishConversion(downloadUrl, customFileName) {
    isConverting = false;
    btnStartDownload.disabled = false;
    progressPanel.style.display = 'none';

    preparedDownloadUrl = downloadUrl;
    preparedFileName = customFileName || `${currentVideoInfo.title}.${currentFormat}`;

    readyFormatLabel.textContent = `${currentFormat.toUpperCase()} (${currentQuality})`;
    readyDescText.innerHTML = `Berkas <strong>${preparedFileName}</strong> berhasil diunduh dan siap disimpan ke komputer Anda!`;
    downloadReadyBox.style.display = 'block';

    showToast('Video asli siap disimpan!', 'success');
    downloadReadyBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-trigger the download
    btnTriggerFileDownload.click();
  }

  // --- Trigger File Download into User Browser ---
  btnTriggerFileDownload.addEventListener('click', () => {
    if (!preparedDownloadUrl) return;

    const a = document.createElement('a');
    a.href = preparedDownloadUrl;
    a.download = preparedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast(`Menyimpan berkas: ${preparedFileName}`, 'success');
  });

  btnDownloadAnother.addEventListener('click', () => {
    downloadReadyBox.style.display = 'none';
    inputUrl.value = '';
    handleUrlChange();
    inputUrl.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- FAQ Accordion ---
  document.querySelectorAll('.faq-item').forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });

  // --- Modal Settings & Backend Configuration ---
  function loadSettings() {
    const defaultEndpoint = (window.location.port === '5000') 
      ? '/api/start-download' 
      : 'http://localhost:5000/api/start-download';

    const savedEndpoint = localStorage.getItem('mp43_api_endpoint') || defaultEndpoint;
    inputApiEndpoint.value = savedEndpoint;
  }

  btnOpenSettings.addEventListener('click', () => {
    loadSettings();
    modalSettings.classList.add('active');
  });

  function closeModal() {
    modalSettings.classList.remove('active');
  }

  btnCloseModal.addEventListener('click', closeModal);
  btnCancelModal.addEventListener('click', closeModal);
  modalSettings.addEventListener('click', (e) => {
    if (e.target === modalSettings) closeModal();
  });

  btnSaveSettings.addEventListener('click', () => {
    const endpoint = inputApiEndpoint.value.trim();
    localStorage.setItem('mp43_api_endpoint', endpoint);
    closeModal();
    showToast('Pengaturan server API berhasil disimpan!', 'success');
  });

  // --- Toast Notifications ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg}<span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 4500);
  }

  function setupEventListeners() {
    document.getElementById('brand-logo-link').addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
