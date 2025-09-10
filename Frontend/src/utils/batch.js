// client/public/js/batch.js
// Mount with:
// <div id="batch-root"></div>
// <script src="/public/js/batch.js"></script>
// <script>BatchPortal.mount('#batch-root');</script>

const BatchPortal = (() => {
  const LIMITS = { SCHOOL_STUDENT: 100, FRIENDS: 15, FAMILY: 25 };

  const el = (tag, attrs = {}, html = '') => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'style') n.setAttribute('style', v);
      else n.setAttribute(k, v);
    }
    if (html) n.innerHTML = html;
    return n;
  };

  const copyText = async (t) => {
    try { await navigator.clipboard.writeText(t); return true; } catch { return false; }
  };

  const api = {
    async registerVisitor(payload) {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || JSON.stringify(json));
      return json;
    },
    async createBatch({ batch_type, lead_visitor_id, member_ids }) {
      const res = await fetch('/api/batch/create', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ batch_type, lead_visitor_id, member_ids })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || JSON.stringify(json));
      return json;
    },
    async createSchoolTeams({ school_name, total_count, date, assign_rfids }) {
      const res = await fetch('/api/school/teams', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ school_name, total_count, date, assign_rfids })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || JSON.stringify(json));
      return json;
    }
  };

  function mount(rootSelector) {
    const root = document.querySelector(rootSelector);
    if (!root) return;

    const wrap = el('div', { class: 'card' });
    wrap.appendChild(el('h2', {}, 'Create Batch'));
    const form = el('form', { id: 'batchForm' });

    form.appendChild(el('label', {}, 'Batch Type'));
    const batchType = el('select', { id: 'batch_type', required: 'true' });
    ['SCHOOL_STUDENT','FRIENDS','FAMILY'].forEach(t => batchType.appendChild(el('option', { value: t }, t)));
    form.appendChild(batchType);

    form.appendChild(el('label', {}, 'Total Members (including lead)'));
    const memberCount = el('input', { id:'member_count', type:'number', min:'1', value:'2', required:'true' });
    form.appendChild(memberCount);

    const leadCard = el('div', { class:'card', style:'background:#f8fafc;border-color:#dbeafe;margin-top:12px' });
    leadCard.appendChild(el('h3', { style:'margin-top:0' }, 'Lead Person'));
    const leadWrap = el('div', { class:'member', 'data-role':'lead' });

    leadWrap.appendChild(el('label', {}, 'Name'));
    const leadName = el('input', { name:'lead_name', required:'true' });
    leadWrap.appendChild(leadName);

    leadWrap.appendChild(el('label', {}, 'Group Type'));
    const leadType = el('select', { name:'lead_group_type', required:'true' });
    ['GENERAL_PUBLIC','UNIVERSITY_STUDENT','COMPANY_REPRESENTATIVE','TEACHER','SCHOOL_STUDENT','FRIENDS','FAMILY']
      .forEach(t => leadType.appendChild(el('option', { value:t }, t)));
    leadWrap.appendChild(leadType);

    leadWrap.appendChild(el('label', {}, 'Organization (School Name for SCHOOL_STUDENT)'));
    const leadOrg = el('input', { name:'lead_organization' });
    leadWrap.appendChild(leadOrg);

    leadWrap.appendChild(el('label', {}, 'Contact Number'));
    const leadContact = el('input', { name:'lead_contact_number' });
    leadWrap.appendChild(leadContact);

    leadCard.appendChild(leadWrap);
    form.appendChild(leadCard);

    const othersCard = el('div', { id:'members_container', class:'card', style:'background:#fff;margin-top:12px' });
    othersCard.appendChild(el('h3', { style:'margin-top:0' }, 'Other Members'));
    othersCard.appendChild(el('p', { style:'color:#475569;margin:0 0 8px 0' }, 'Fields appear based on “Total Members”.'));
    const membersList = el('div', { id:'members_list' });
    othersCard.appendChild(membersList);
    form.appendChild(othersCard);

    const row = el('div', { style:'display:flex;gap:8px;flex-wrap:wrap;margin-top:12px' });
    const submitBtn = el('button', { class:'btn', type:'submit' }, 'Create Batch');
    const cancelA = el('a', { class:'btn', href:'/' }, 'Cancel');
    row.appendChild(submitBtn);
    row.appendChild(cancelA);
    form.appendChild(row);

    const summaryRoot = el('div', { id:'summary_root', style:'margin-top:12px' });
    wrap.appendChild(form);
    wrap.appendChild(summaryRoot);
    root.appendChild(wrap);

    function renderMembers() {
      const type = batchType.value;
      const totalRequested = Number(memberCount.value || 0);

      if (type === 'SCHOOL_STUDENT') {
        othersCard.style.display = 'none';
        membersList.innerHTML = '';
        return;
      }

      othersCard.style.display = 'block';
      const max = LIMITS[type] ?? 25;
      if (totalRequested > max) {
        alert(`Selected batch type allows up to ${max} total members.`);
        memberCount.value = String(max);
      }
      const total = Math.max(1, Math.min(Number(memberCount.value || 1), max));
      const others = total - 1;

      membersList.innerHTML = '';
      for (let i = 0; i < others; i++) {
        const idx = i + 1;
        const box = el('div', { class:'member', style:'border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:8px 0;' });
        box.innerHTML = `
          <h4 style="margin:0 0 8px 0">Member ${idx}</h4>
          <label>Name</label>
          <input name="m${idx}_name" required />
          <label>Group Type</label>
          <select name="m${idx}_group_type" required>
            <option value="GENERAL_PUBLIC">GENERAL_PUBLIC</option>
            <option value="UNIVERSITY_STUDENT">UNIVERSITY_STUDENT</option>
            <option value="COMPANY_REPRESENTATIVE">COMPANY_REPRESENTATIVE</option>
            <option value="TEACHER">TEACHER</option>
            <option value="SCHOOL_STUDENT">SCHOOL_STUDENT</option>
            <option value="FRIENDS">FRIENDS</option>
            <option value="FAMILY">FAMILY</option>
          </select>
          <label>Organization</label>
          <input name="m${idx}_organization" />
          <label>Contact Number</label>
          <input name="m${idx}_contact_number" />
        `;
        membersList.appendChild(box);
      }
    }

    memberCount.addEventListener('input', renderMembers);
    batchType.addEventListener('change', renderMembers);
    renderMembers();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      summaryRoot.innerHTML = '';

      const type = batchType.value;
      const total = Number(memberCount.value || 0);
      if (!total || total < 1) {
        alert('Total members must be at least 1.');
        return;
      }

      submitBtn.disabled = true;

      try {
        if (type === 'SCHOOL_STUDENT') {
          const leadPayload = {
            name: (leadName.value || '').trim(),
            group_type: leadType.value || 'TEACHER',
            organization: leadOrg.value || null,
            contact_number: leadContact.value || null
          };
          if (!leadPayload.name) throw new Error('Lead name is required.');
          const lead = await api.registerVisitor(leadPayload);

          let schoolName = (leadOrg.value || '').trim();
          if (!schoolName) {
            schoolName = prompt('Enter School Name for team numbering and RFID assignment:') || '';
            schoolName = schoolName.trim();
            if (!schoolName) throw new Error('School name is required.');
          }

          const result = await api.createSchoolTeams({
            school_name: schoolName,
            total_count: total,
            assign_rfids: true
          });

          const list = (result.teams || []).map(t =>
            `<tr><td>${t.team_name}</td><td><code>${t.team_id}</code></td><td>${t.rfid_tag ? `<code>${t.rfid_tag}</code>` : '-'}</td></tr>`
          ).join('');

          const block = el('div', { class:'card', style:'background:#f8fafc;border-color:#dbeafe' });
          block.innerHTML = `
            <h3 style="margin-top:0">School Teams Created</h3>
            <p><strong>School:</strong> ${result.school.name} &nbsp; <strong>Date:</strong> ${result.date}</p>
            <p><strong>Lead:</strong> ${lead.name} (UUID: ${lead.id})</p>
            <table style="width:100%;border-collapse:collapse">
              <thead><tr><th style="text-align:left">Team</th><th style="text-align:left">Team UUID</th><th style="text-align:left">RFID</th></tr></thead>
              <tbody>${list}</tbody>
            </table>
            <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
              <button class="btn" type="button" id="copyTeams">Copy Team List</button>
              <a class="btn" href="/school">Open School Page</a>
              <a class="btn" href="/">Home</a>
            </div>
          `;
          summaryRoot.appendChild(block);

          block.querySelector('#copyTeams')?.addEventListener('click', async () => {
            const lines = (result.teams || []).map(t => `${t.team_name}: ${t.rfid_tag || '-'}`).join('\n');
            await navigator.clipboard.writeText(lines);
            alert('Copied.');
          });

          return;
        }

        // Non-school flows: original member registration + batch create
        const max = LIMITS[type] ?? 25;
        if (total > max) throw new Error(`Selected batch type allows up to ${max} members.`);

        const leadPayload = {
          name: (leadName.value || '').trim(),
          group_type: leadType.value,
          organization: leadOrg.value || null,
          contact_number: leadContact.value || null
        };
        if (!leadPayload.name) throw new Error('Lead name is required.');
        const lead = await api.registerVisitor(leadPayload);
        const leadId = lead.id;

        const memberIds = [];
        for (let i = 1; i <= total - 1; i++) {
          const mName = form.querySelector(`[name="m${i}_name"]`)?.value?.trim() || '';
          const mType = form.querySelector(`[name="m${i}_group_type"]`)?.value || 'GENERAL_PUBLIC';
          const mOrg  = form.querySelector(`[name="m${i}_organization"]`)?.value || null;
          const mTel  = form.querySelector(`[name="m${i}_contact_number"]`)?.value || null;
          if (!mName) throw new Error(`Member ${i} name is required.`);
          const v = await api.registerVisitor({ name: mName, group_type: mType, organization: mOrg, contact_number: mTel });
          memberIds.push(v.id);
        }

        const batch = await api.createBatch({ batch_type: type, lead_visitor_id: leadId, member_ids: memberIds });

        const sum = el('div', { class:'card', style:'background:#f8fafc;border-color:#dbeafe' });
        const all = [leadId, ...memberIds].join(', ');
        sum.innerHTML = `
          <h3 style="margin-top:0">Batch Created</h3>
          <p><strong>Batch ID:</strong> <code>${batch.batch_id}</code></p>
          <p><strong>Lead UUID:</strong> <code>${leadId}</code></p>
          <p><strong>Member UUIDs:</strong><br><code style="word-break:break-all">${memberIds.join(', ') || '(none)'}</code></p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <button class="btn" type="button" id="copyBatch">Copy Batch ID</button>
            <button class="btn" type="button" id="copyAll">Copy All UUIDs</button>
            <a class="btn" href="/batch">Create Another</a>
            <a class="btn" href="/">Home</a>
          </div>
        `;
        summaryRoot.appendChild(sum);

        sum.querySelector('#copyBatch')?.addEventListener('click', async () => {
          await navigator.clipboard.writeText(batch.batch_id);
          alert('Batch ID copied');
        });
        sum.querySelector('#copyAll')?.addEventListener('click', async () => {
          await navigator.clipboard.writeText(all);
          alert('All UUIDs copied');
        });
      } catch (err) {
        console.error(err);
        alert('Failed: ' + err.message);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  return { mount };
})();

document.addEventListener('DOMContentLoaded', () => {
  const target = document.querySelector('#batch-root');
  if (target) BatchPortal.mount('#batch-root');
});
