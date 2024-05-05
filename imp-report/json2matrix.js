export class JSON2Matrix {
  constructor( json_url ) {
    this.json = null;
    this.load_json(json_url);
  }

  load_json (json_url) {
    fetch(json_url)
      .then( response =>  response.json() )
      .then((json) => {
        this.json = json;
      })
      .then(() => {
        this.create_implementations_table();
        this.create_milestones_table();
        this.create_use_cases_table();
      })
  }



  create_implementations_table () {
    const imp_container = document.getElementById('implementation_container');
    // console.log(this.json);

    // create implementations table element
    let imp_table_el = document.createElement('table');
    imp_table_el.id = 'implementations-table';
    imp_table_el.classList.add('imp_table');

    let imp_thead = document.createElement('thead');
    imp_table_el.append(imp_thead);
    let imp_tr = document.createElement('tr');
    imp_thead.append(imp_tr);

    const name_th = document.createElement('th');
    name_th.textContent = 'implementation name';

    const org_th = document.createElement('th');
    org_th.textContent = 'organization';

    const desc_th = document.createElement('th');
    desc_th.textContent = 'description';

    const type_th = document.createElement('th');
    type_th.textContent = 'type';

    imp_tr.append(name_th, org_th, desc_th, type_th);


    let imp_tbody = document.createElement('tbody');
    imp_table_el.append(imp_tbody);


    // iterate over implementations for header row
    const imps = this.json['implementations'];
    for(let imp of imps) {
      const tr = document.createElement('tr');
      let cellType = 'th';
   
      Object.keys(imp).forEach(key=>{
        const impObj = imp[key];
        Object.keys(impObj).forEach(label=>{
          const val = impObj[label];

          const cell = document.createElement(cellType);
          cell.textContent = val;
          tr.append(cell);

          cellType = 'td';
        });
      });

      imp_tbody.append(tr);
    }

    imp_table_el.append(imp_tbody);
    imp_container.append(imp_table_el);
  }



  create_milestones_table () {
    const container = document.getElementById('milestone_table_container');
    // const imp_container = document.getElementById('implementation_container');
    // console.log(this.json);

    // create milestones table element
    let table_el = document.createElement('table');
    table_el.id = 'milestones-table';

    let thead = document.createElement('thead');
    table_el.append(thead);
    let tr = document.createElement('tr');
    thead.append(tr);

    let th = document.createElement('th');
    th.textContent = 'milestone';
    tr.append(th);

    // let dl = document.createElement('dl');

    // iterate over implementations for header row
    const imps = this.json['implementations'];
    for(let imp of imps) {
      // console.log(imp)
      Object.keys(imp).forEach(key=>{
        const val = imp[key];
        let th = document.createElement('th');
        th.textContent = val.title;
        tr.append(th);

        // // add entry to implementations definition list
        // let dt = document.createElement('dt');
        // dt.textContent = val.title;
        // dl.append(dt);
        // let dd = document.createElement('dd');
        // dd.textContent = `${val.desc} (${val.type})`;
        // dl.append(dd);
      });
    }

    let tbody = document.createElement('tbody');
    table_el.append(tbody);

    // iterate over grouping rows, which are stored separately from milestones
    const groups = this.json['milestone-groups'];
    Object.keys(groups).forEach(key=>{
      const val = groups[key];

      let tr = document.createElement('tr');
      tr.id = key;
      let th = document.createElement('th');
      th.setAttribute('colspan', '999');
      th.classList.add('ucr-category');
      if (!val.parent_id) {
        th.classList.add('ucr-group');
      }
      
      let a = document.createElement('a');
      // a.href = `./#${key}`;
      a.href = val.url;
      if (val.url.includes('.svg')) {
        const thumbnail = document.createElement('img');
        thumbnail.classList.add('thumbnail');
        thumbnail.src = val.url;
        a.append(thumbnail);
      }

      // a.textContent = val.title;
      let title_span = document.createElement('span');
      title_span.textContent = val.title;

      let index_span = document.createElement('span');
      index_span.classList.add('index');
      index_span.textContent = ` (${val.index})`;
      title_span.append(index_span);
      a.append(title_span);
      th.append(a);
      

      tr.append(th);
      tbody.append(tr);
    });


    // iterate over milestone rows
    const milestones = this.json['milestones'];
    Object.keys(milestones).forEach(key=>{
      const val = milestones[key];

      let tr = document.createElement('tr');
      tr.id = key;
      let th = document.createElement('th');
      th.classList.add('milestone');
      let a = document.createElement('a');
      a.href = `./#${key}`;
      a.textContent = val.title;
      let index_span = document.createElement('span');
      index_span.classList.add('index');
      index_span.textContent = ` (${val.index})`;
      a.append(index_span);
      th.append(a);
      tr.append(th);

      // iterate over implementation support columns for each milestone rows
      const cap_imps = val['implementations'];
      for(let cap_imp of cap_imps) {
        Object.keys(cap_imp).forEach(key=>{
          const val = cap_imp[key];
          const td = document.createElement('td');
          const support_status = val.support;
          if (support_status) {
            td.classList.add(support_status.replace('/', '_'));
          }
          td.textContent = support_status;

          // // add note if available
          // const notes = val.notes;
          // if (notes) {
          //   const note_el = document.createElement('span');
          //   note_el.classList.add('note');
          //   note_el.textContent = notes;
          //   td.append(note_el);
          //   td.classList.add('annotated');
          // }


          tr.append(td);
        });
      }

      // position each milestone in the proper section, relative to its grouping row
      const parent_row = tbody.querySelector(`#${val.parent_id}`);
      let next_row = parent_row;
      while (next_row.nextElementSibling 
        && next_row.nextElementSibling.firstChild.classList.contains('milestone')) {
        next_row = next_row.nextElementSibling;
      }
      next_row.after(tr);
    });

    container.append(table_el);
    // imp_container.append(dl);
  }


  create_use_cases_table () {
    const container = document.getElementById('use_case_container');
    const milestones = this.json['milestones'];

    let table_el = document.createElement('table');
    table_el.id = 'use-cases-table';
    let thead = document.createElement('thead');
    table_el.append(thead);
    let tr = document.createElement('tr');
    thead.append(tr);

    // create table headers
    const use_case_headers = [
      'use case',
      'milestones'
    ];

    for(let use_case_header of use_case_headers) {
      let th = document.createElement('th');
      th.textContent = use_case_header;
      tr.append(th);
    }

    let tbody = document.createElement('tbody');
    table_el.append(tbody);

    // iterate over use-case rows (includes use-case group rows)
    const use_cases = this.json['use-cases'];
    Object.keys(use_cases).forEach(key=>{
      const val = use_cases[key];

      let tr = document.createElement('tr');
      tr.id = key;
      let th = document.createElement('th');
      
      let a = document.createElement('a');
      a.href = `./#${key}`;
      a.textContent = val.title;
      let index_span = document.createElement('span');
      index_span.classList.add('index');
      index_span.textContent = ` (${val.index})`;
      a.append(index_span);
      th.append(a);
      tr.append(th);

      if (!val.parent_id) {
        // if this is a use-case group row, mark the class and colspan
        th.classList.add('ucr-category');
        th.setAttribute('colspan', '999');
      } else {
        // iterate over related milestones for each use case
        let td = document.createElement('td');
        let ul = document.createElement('ul');
        td.append(ul);
        const milestone_features = val['milestones'];
        Object.keys(milestone_features).forEach(key=>{
          const milestone = milestones[key];
          if (milestone) {
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.href = `#${key}`;
  
            a.textContent = milestone.title;
  
            let index_span = document.createElement('span');
            index_span.classList.add('index');
            index_span.textContent = ` (${milestone.index})`;
            a.append(index_span);
            td.append(a);
      
            li.append(a);
            ul.append(li);
          }
        });
        tr.append(td);
      }
      tbody.append(tr);
    });

    container.append(table_el);
  }
}
