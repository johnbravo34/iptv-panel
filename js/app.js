document.addEventListener("DOMContentLoaded", () => {
    initAccountSelect();
    checkActiveDomainOnLoad();
});

function initAccountSelect() {
    const select = document.getElementById("user-select");
    ACCOUNTS.forEach((acc, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = acc.username;
        select.appendChild(option);
    });
    generateUserM3u();
}

async function checkDomainHealth(domain) {
    const testAccount = ACCOUNTS[0];
    const testUrl = `http://${domain}/get.php?username=${testAccount.username}&password=${testAccount.password}&type=m3u_plus`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 saniye zaman aşımı

        const response = await fetch(testUrl, {
            method: 'HEAD',
            mode: 'no-cors',
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return true;
    } catch (error) {
        return false;
    }
}

async function checkAllDomains() {
    const statusBadge = document.getElementById("status-badge");
    const activeDomainEl = document.getElementById("active-domain");
    const downloadBtn = document.getElementById("btn-download");
    const domainListEl = document.getElementById("domain-list");

    statusBadge.className = "badge warning";
    statusBadge.textContent = "Test Ediliyor...";
    domainListEl.innerHTML = "";

    let workingDomain = null;

    for (const domain of DOMAINS) {
        const li = document.createElement("li");
        li.textContent = domain;

        const isWorking = await checkDomainHealth(domain);

        if (isWorking) {
            li.innerHTML += ' <span class="badge success">Çalışıyor</span>';
            if (!workingDomain) {
                workingDomain = domain;
            }
        } else {
            li.innerHTML += ' <span class="badge danger">Erişilemiyor</span>';
        }
        domainListEl.appendChild(li);
    }

    if (workingDomain) {
        localStorage.setItem("active_iptv_domain", workingDomain);
        activeDomainEl.textContent = workingDomain;
        statusBadge.className = "badge success";
        statusBadge.textContent = "Aktif Sunucu Bulundu";
        downloadBtn.disabled = false;
    } else {
        activeDomainEl.textContent = "Hiçbiri Çalışmıyor";
        statusBadge.className = "badge danger";
        statusBadge.textContent = "Bağlantı Hatası";
        downloadBtn.disabled = true;
    }

    generateUserM3u();
}

function checkActiveDomainOnLoad() {
    const savedDomain = localStorage.getItem("active_iptv_domain");
    if (savedDomain) {
        document.getElementById("active-domain").textContent = savedDomain;
        document.getElementById("status-badge").className = "badge success";
        document.getElementById("status-badge").textContent = "Hafızadan Yüklendi";
        document.getElementById("btn-download").disabled = false;
        generateUserM3u();
    } else {
        checkAllDomains();
    }
}

function generateUserM3u() {
    const select = document.getElementById("user-select");
    const output = document.getElementById("m3u-output");
    const selectedAcc = ACCOUNTS[select.value];
    const activeDomain = localStorage.getItem("active_iptv_domain") || DOMAINS[0];

    const m3uUrl = `http://${activeDomain}/get.php?username=${selectedAcc.username}&password=${selectedAcc.password}&type=m3u_plus`;
    output.value = m3uUrl;
}

function downloadActiveM3u() {
    const m3uUrl = document.getElementById("m3u-output").value;
    window.open(m3uUrl, '_blank');
}

function copyLink() {
    const copyText = document.getElementById("m3u-output");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    alert("M3U Linki kopyalandı!");
}
