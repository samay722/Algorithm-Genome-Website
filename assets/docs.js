const escapeHTML=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
let codeIndex=0;
function code(source,filename='example.py'){let id='block-'+(++codeIndex);return `<div class="code-window"><div class="code-head"><div class="window-dots"><b></b><b></b><b></b></div><span class="code-title">${escapeHTML(filename)}</span><button class="copy" data-copy-target="${id}">Copy</button></div><pre id="${id}"><code>${escapeHTML(source.trim())}</code></pre></div>`;}
function table(headers, rows){return `<table><thead><tr>${headers.map(h=>`<th>${escapeHTML(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table>`;}
const pages={
'introduction':{title:'Introduction',desc:'A composable Python framework for practical, tabular machine learning.',group:'GET STARTED',body:()=>`<div class="banner"><strong>Version 1.0.0rc3</strong> is a source release candidate. The site documents features in the source archive; it does not imply this version has been uploaded to PyPI.</div><h2 id="why">Why Algorithm Genome?</h2><p>Algorithm Genome provides a coherent layer around established Python ML libraries. Define a dataset and task, configure preprocessing, compare compatible estimators, evaluate on a held-out partition and persist the resulting model.</p><p>It also includes algorithm discovery, a separate unsupervised pipeline, the original algorithm recommendation APIs, and in-process workflow graphs.</p><h2 id="use-cases">What can it do?</h2>${table(['Area','Support'],[['Supervised learning','Classification and regression on independent-row tabular datasets'],['Unsupervised learning','Clustering, anomaly detection and dimensionality reduction'],['Model selection','Training-partition cross-validation and candidate leaderboard'],['Extensibility','Installed estimator catalog and custom estimator registration'],['Orchestration','Graph workflow execution, conditional routing and checkpoint backends']])}<h2 id="start">Start here</h2><p>Install the source checkout, then follow the <a href="#quickstart">five-minute quickstart</a>. For details about supported problem types, see <a href="#scope">scope and limitations</a>.</p>`},
'installation':{title:'Installation',desc:'Set up Python, install the source release candidate, and verify it works.',group:'GET STARTED',body:()=>`<div class="banner"><strong>Note:</strong> To work specifically with v1.0.0rc3, install the source checkout. An unpinned <code>pip install algorithm-genome</code> might install a different currently published release.</div><h2 id="requirements">Requirements</h2><ul><li>Python 3.11 or newer (Python 3.12 is a well-tested local development choice)</li><li>pip and a virtual environment</li><li>scikit-learn, pandas, NumPy and joblib are declared as package dependencies</li></ul><h2 id="windows">Windows / PowerShell</h2><p>Open a terminal inside the extracted <code>Algorithm-Genome-main</code> directory containing <code>pyproject.toml</code>.</p>${code(`py -3.12 -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -e .
python -m pip install pytest
python -m pytest -q`,'PowerShell')}<p>If activation is restricted, you can use <code>.venv\\Scripts\\python.exe</code> directly instead of activating the environment.</p><h2 id="mac">macOS / Linux</h2>${code(`python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -e .
python -m pip install pytest
python -m pytest -q`,'Terminal')}<h2 id="verify">Verify package import</h2>${code(`python -c "import algorithm_genome as ag; print(ag.Pipeline); print(ag.discover_algorithms('classification')[:3])"`,'Terminal')}<p>Use <code>python -m pip show algorithm-genome</code> to verify the installed version and environment. If imports fail, confirm that the same Python interpreter is used for installation and execution.</p>`},
'quickstart':{title:'Quickstart',desc:'Build and evaluate your first classification pipeline in a few lines.',group:'GET STARTED',body:()=>`<h2 id="dataset">1. Prepare a dataset</h2><p>Use a CSV file or a pandas DataFrame with a column containing the labels you want to predict. This example generates a known scikit-learn sample dataset, then uses Algorithm Genome for the pipeline.</p>${code(`from sklearn.datasets import load_wine
load_wine(as_frame=True).frame.to_csv('wine.csv', index=False)`,'prepare_data.py')}<h2 id="pipeline">2. Define the pipeline</h2>${code(`import algorithm_genome as ag

result = (
    ag.Pipeline('wine_experiment', random_state=42)
    .load('wine.csv')
    .target('target')
    .preprocess(missing='auto', categorical='auto', scale='auto')
    .split(test_size=0.2, cv=3)
    .select_model(task='classification', candidates=[
        'logistic_regression', 'random_forest',
        'decision_tree', 'knn', 'svm',
        'gradient_boosting', 'extra_trees', 'naive_bayes'
    ])
    .evaluate(metrics=['accuracy', 'f1_macro'])
    .run()
)

print('Best model:', result.best_model)
print('Holdout metrics:', result.metrics)
print(result.leaderboard.to_string(index=False))`,'wine_demo.py')}<h2 id="interpret">3. Understand the results</h2><p><code>result.leaderboard</code> ranks candidates using cross-validation on training data. <code>result.metrics</code> contains metrics measured on the reserved holdout partition. The winning estimator is not automatically evidence that it will be best on every future dataset.</p><h2 id="save">4. Save the fitted model</h2>${code(`result.save('artifacts/wine')`,'wine_demo.py')}<p>For other ML tasks, visit the <a href="#model-selection">model selection guide</a> or <a href="#unsupervised">unsupervised guide</a>.</p>`},
'model-selection':{title:'Model selection',desc:'Compare candidates without training on the holdout partition.',group:'CORE CONCEPTS',body:()=>`<h2 id="flow">How selection works</h2><ol><li>Dataset is split into training and holdout partitions.</li><li>Preprocessing is fitted inside cross-validation folds.</li><li>Each candidate is scored using training-partition cross-validation.</li><li>The best-ranked candidate is fitted on the training partition.</li><li>Holdout metrics are measured separately.</li></ol><h2 id="classification">Classification</h2>${code(`result = (
    ag.Pipeline('classification', random_state=42)
    .load('training.csv')
    .target('label')
    .split(test_size=0.2, cv=5)
    .select_model(task='classification', candidates=[
        'logistic_regression', 'random_forest', 'svm'
    ])
    .evaluate(metrics=['accuracy', 'f1_macro'])
    .run()
)`)}<h2 id="regression">Regression</h2>${code(`result = (
    ag.Pipeline('housing')
    .load('housing.csv')
    .target('price')
    .select_model(task='regression', candidates=[
        'ridge', 'random_forest'
    ])
    .evaluate(metrics=['r2', 'neg_root_mean_squared_error'])
    .run()
)`)}<h2 id="tuning">Hyperparameter tuning</h2><p>Supported tuning takes place on the training partition. The <code>trials</code> argument configures the model search rather than making all algorithms automatically available.</p>${code(`pipeline = (
    ag.Pipeline('tuning')
    .load('training.csv').target('label')
    .select_model(task='classification')
    .tune(trials=20)
)
result = pipeline.run()`)}<div class="banner"><strong>Important:</strong> Independent-row splits do not protect grouped, patient-correlated or temporal datasets. Such data requires appropriate custom splitting strategies not provided by this current general-purpose pipeline.</div>`},
'unsupervised':{title:'Unsupervised machine learning',desc:'Clustering, anomaly detection, and feature transformations.',group:'CORE CONCEPTS',body:()=>`<p>Algorithm Genome exposes <code>UnsupervisedPipeline</code> for tasks that do not use supervised target labels. These tasks have different fitting methods and evaluation criteria.</p><h2 id="clustering">Clustering</h2><p>Named clustering implementations include K-Means, DBSCAN, agglomerative clustering and Gaussian mixture models (availability can depend on your installation and configuration).</p>${code(`import algorithm_genome as ag

print(ag.available_unsupervised('clustering'))
print(ag.discover_algorithms('clustering')[:10])`,'clustering_catalog.py')}<h2 id="anomaly">Anomaly detection</h2><p>Discover built-in anomaly detectors such as Isolation Forest, Local Outlier Factor, One-Class SVM and Elliptic Envelope.</p>${code(`print(ag.available_unsupervised('anomaly_detection'))`,'anomaly_catalog.py')}<h2 id="reduction">Dimensionality reduction</h2><p>Use supported estimators to reduce or transform feature spaces, including PCA and TruncatedSVD.</p>${code(`print(ag.available_unsupervised('dimensionality_reduction'))`,'reduction_catalog.py')}<div class="banner"><strong>Evaluation differs by task.</strong> Accuracy and F1 are supervised classification metrics. For clustering, use a valid clustering metric when its assumptions hold; anomaly detection may need labeled evaluation data or external validation. See the shipped <code>test/test_unsupervised.py</code> for API-tested examples.</div>`},
'algorithms':{title:'Algorithm catalog',desc:'Explore available estimators, resolve built-in aliases, and plug in custom models.',group:'CORE CONCEPTS',body:()=>`<h2 id="discovery">Discover installed estimators</h2>${code(`import algorithm_genome as ag

classifiers = ag.discover_algorithms('classification')
regressors = ag.discover_algorithms('regression')
clustering = ag.discover_algorithms('clustering')

print(classifiers[:10])
print(regressors[:10])`)}<h2 id="aliases">Built-in classification aliases</h2>${table(['Alias','Purpose'],[['<code>logistic_regression</code>','Linear classifier'],['<code>random_forest</code>','Tree ensemble'],['<code>decision_tree</code>','Single decision tree'],['<code>knn</code>','Nearest-neighbor classifier'],['<code>svm</code>','Support vector machine'],['<code>gradient_boosting</code>','Boosted ensemble'],['<code>extra_trees</code>','Extremely randomized tree ensemble'],['<code>naive_bayes</code>','Probabilistic baseline']])}<h2 id="registration">Custom registration</h2><p>For estimators not covered by aliases, register a compatible scikit-learn-style object explicitly.</p>${code(`from sklearn.tree import DecisionTreeClassifier
import algorithm_genome as ag

ag.register_model(
    'shallow_tree',
    DecisionTreeClassifier(max_depth=3),
    task='classification',
    overwrite=True
)

print(ag.available_models('classification'))`)}<h2 id="limits">Discovery vs. compatibility</h2><p>Discovering an estimator does not guarantee it works with every dataset, every task or every evaluation metric. Some algorithms require additional parameters or specific feature constraints. Unknown candidate names should produce actionable errors.</p>`},
'workflows':{title:'Graph workflows',desc:'Compose synchronous processing steps using state, conditional edges, and callbacks.',group:'CORE CONCEPTS',body:()=>`<h2 id="first-graph">Your first graph</h2>${code(`import algorithm_genome as ag

graph = ag.Workflow()
graph.add_node('double', lambda s: {'result': s['value'] * 2})
graph.add_edge(ag.START, 'double')
graph.add_edge('double', ag.END)

print(graph.invoke({'value': 10}))
# {'value': 10, 'result': 20}`)}<h2 id="conditional">Conditional routing</h2>${code(`graph = ag.Workflow()
graph.add_node('check', lambda s: {'positive': s['value'] > 0})
graph.add_node('yes', lambda s: {'result': 'positive'})
graph.add_node('no', lambda s: {'result': 'not positive'})
graph.add_edge(ag.START, 'check')
graph.add_conditional_edges(
    'check',
    lambda s: 'yes' if s['positive'] else 'no',
    ['yes', 'no']
)
graph.add_edge('yes', ag.END).add_edge('no', ag.END)
print(graph.invoke({'value': -1}))`)}<h2 id="runnable">Runnable composition</h2>${code(`from algorithm_genome import RunnableLambda

pipeline = (RunnableLambda(lambda x: x + 5)
           | RunnableLambda(lambda x: x * 2))
print(pipeline.invoke(10))  # 30`)}<h2 id="recovery">Execution and recovery</h2><p>Supported workflows provide steps, max-step bounds and checkpoint backends. Checkpointing is JSON-based and cannot persist arbitrary non-JSON state without conversion. The runtime is not a distributed executor or a LangGraph-compatible API.</p>`},
'persistence':{title:'Persistence and artifacts',desc:'Save fitted ML models and checkpoint supported workflow state.',group:'CORE CONCEPTS',body:()=>`<h2 id="model">Save and load model results</h2>${code(`from algorithm_genome import MLResult

# Following Pipeline(...).run()
result.save('artifacts/model')

restored = MLResult.load('artifacts/model')
predictions = restored.predict(new_rows)`)}<p>Saved prediction artifacts rely on joblib/pickle. Load only models you trust and keep dependencies compatible. Fitted results are trained on the training partition; explicitly refit to all data if a deployment model is required.</p><h2 id="checkpoint">Workflow checkpoint backends</h2><p><code>MemoryCheckpointer</code> keeps state in-process. <code>SQLiteCheckpointer</code> stores JSON snapshots on disk and closes connections per operation.</p>${code(`from algorithm_genome import MemoryCheckpointer, SQLiteCheckpointer

memory = MemoryCheckpointer()
sqlite = SQLiteCheckpointer('workflow.db')`)}<h2 id="security">Security guidance</h2><ul><li>Never load untrusted pickle/joblib artifacts.</li><li>Do not store secrets in source code or public repositories.</li><li>Protect sensitive datasets and consider privacy requirements.</li><li>Use environment-specific dependency pinning for reproducibility.</li></ul>`},
'api':{title:'API reference',desc:'Core public functions and classes exposed by algorithm_genome.',group:'REFERENCE',body:()=>`<h2 id="training-api">Supervised ML</h2>${table(['API','Role'],[['<code>Pipeline</code>','Fluent supervised ML experimentation'],['<code>MLResult</code>','Fitted estimator, metrics, leaderboard and artifacts'],['<code>available_models(task)</code>','List known model aliases'],['<code>register_model(...)</code>','Register a custom model estimator'],['<code>profile(...)</code>','Summarize tabular data characteristics']])}<h2 id="catalog-api">Catalog and unsupervised</h2>${table(['API','Role'],[['<code>discover_algorithms(task)</code>','List compatible installed estimator names'],['<code>algorithm_instance(name, task)</code>','Create an estimator by name'],['<code>register_algorithm(...)</code>','Extend algorithm discovery'],['<code>UnsupervisedPipeline</code>','Clustering, anomaly detection and reduction pipeline'],['<code>available_unsupervised(...)</code>','List named unsupervised algorithms']])}<h2 id="legacy-api">Recommendation and verification</h2>${table(['API','Role'],[['<code>recommend(data, target)</code>','Rank candidate classification algorithms'],['<code>verify(data, target)</code>','Train and measure algorithm shortlist'],['<code>Recommender</code>','Bundled learned recommender and fallback option'],['<code>save_model</code> / <code>load_model</code>','Persist supported model artifacts'],['<code>show</code> / <code>save_report</code>','Display and export reports']])}<h2 id="workflow-api">Runtime</h2>${table(['API','Role'],[['<code>Workflow</code> / <code>START</code> / <code>END</code>','Graph nodes and edges'],['<code>Runnable</code> / <code>RunnableLambda</code>','Composable function execution'],['<code>MemoryCheckpointer</code>','In-memory state'],['<code>SQLiteCheckpointer</code>','JSON snapshot persistence'],['<code>Registry</code>','Reusable extensions']])}<p>Source API is authoritative; method signatures may evolve before a stable release. See the <a href="https://github.com/mayank1232w/Algorithm-Genome">repository</a> for implementation and tests.</p>`},
'scope':{title:'Scope and limitations',desc:'Know exactly where this release candidate is safe to apply—and where it is not.',group:'REFERENCE',body:()=>`<div class="banner"><strong>Release candidate:</strong> This codebase is not yet independently certified for production use. Windows-local and author-run tests do not establish a broad compatibility or performance guarantee.</div><h2 id="supported">Supported</h2><ul><li>Independent-row tabular classification and regression</li><li>Training-only cross-validation, basic tuning and reserved holdout evaluation</li><li>Clustering, anomaly detection and dimensionality reduction with compatible estimators</li><li>Model discovery and custom estimator registration</li><li>In-process graphs and memory/SQLite checkpointing</li></ul><h2 id="not-supported">Not a native feature in this release</h2><ul><li>Deep neural-network training engines or transformer pretraining</li><li>Temporal forecasting orchestration and leakage-safe time-series splitting</li><li>Reinforcement learning, federated learning or distributed training</li><li>Automatic support for every algorithm in all external ML frameworks</li><li>Production observability, enterprise authentication or cloud deployment service</li></ul><h2 id="evaluation">Evaluation cautions</h2><p>Best-model selection is conditional on the tested dataset, candidate set, metric and partition. High holdout accuracy on a small sample does not predict universal performance. Use domain-appropriate validation, repeated evaluations and data leakage checks before production decisions.</p><h2 id="license">Licensing and release metadata</h2><p>The inspected v1.0.0rc3 source declares a package version and a GitHub source URL. A final license file and consistent README/version metadata should be reviewed and finalized by the project owner before a public stable release.</p>`},
'publishing':{title:'Release and publishing',desc:'Release-candidate packaging, validation, and publishing workflow.',group:'REFERENCE',body:()=>`<h2 id="prepare">Before publication</h2><p>Finalize license, README, dependencies, version and package metadata. Run full tests on supported Python versions and verify a clean install. Publish only to a package name you own.</p><h2 id="build">Build distributions</h2>${code(`python -m pip install --upgrade build twine
python -m pytest -q
python -m build
python -m twine check dist/*`,'PowerShell / Terminal')}<h2 id="testpypi">TestPyPI first</h2>${code(`python -m twine upload --repository testpypi dist/*`,'Terminal')}<p>Check the resulting distribution in a clean virtual environment and confirm sample imports, model training, docs and metadata. Do not expose tokens in your repository.</p><h2 id="pypi">Production PyPI</h2>${code(`python -m twine upload dist/*`,'Terminal')}<p>Use a PyPI API token, preferably replaced by Trusted Publishing for future releases. <strong>This website does not submit a release automatically.</strong></p>`}
};
const order=Object.keys(pages);const content=document.getElementById('docs-content');const toc=document.getElementById('toc-links');const input=document.getElementById('docs-search');const results=document.getElementById('search-results');
function render(){let slug=decodeURIComponent(location.hash.slice(1))||'introduction';if(!pages[slug])slug='introduction';const page=pages[slug];codeIndex=0;content.innerHTML=`<div class="kicker">${page.group} / v1.0.0rc3</div><div class="docs-heading" style="margin-top:13px"><h1>${page.title}</h1></div><p class="docs-lead">${page.desc}</p><div style="height:1px;background:var(--line);margin:30px 0 20px"></div>${page.body()}<div class="doc-next"><span>${slug==='introduction'?'Explore the docs':'Continue learning'}</span>${order.indexOf(slug)<order.length-1?`<a href="#${order[order.indexOf(slug)+1]}">Next: ${pages[order[order.indexOf(slug)+1]].title} →</a>`:'<a href="#introduction">Back to introduction ↑</a>'}</div>`;document.querySelectorAll('.docs-sidebar [data-page]').forEach(a=>a.classList.toggle('active',a.dataset.page===slug));toc.innerHTML=[...content.querySelectorAll('h2[id]')].map(h=>`<a href="#${slug}" data-scroll="${h.id}">${h.textContent}</a>`).join('');toc.querySelectorAll('[data-scroll]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById(a.dataset.scroll)?.scrollIntoView({behavior:'smooth'})}));content.querySelectorAll('[data-copy-target]').forEach(button=>button.addEventListener('click',async()=>{let element=document.getElementById(button.dataset.copyTarget);if(!element)return;try{await navigator.clipboard.writeText(element.textContent);button.textContent='Copied!';setTimeout(()=>button.textContent='Copy',1500)}catch{button.textContent='Select to copy'}}));document.title=`${page.title} — Algorithm Genome Docs`;window.scrollTo({top:0,behavior:'instant'});document.getElementById('docs-sidebar').classList.remove('open')}
window.addEventListener('hashchange',render);render();
input.addEventListener('input',()=>{let q=input.value.trim().toLowerCase();if(!q){results.classList.remove('show');return}let found=order.filter(k=>[pages[k].title,pages[k].desc,k].join(' ').toLowerCase().includes(q));results.innerHTML=found.length?found.map(k=>`<div role="option" tabindex="0" class="search-result" data-goto="${k}">${pages[k].title}<div style="font-size:10px;color:#788e9c">${pages[k].desc}</div></div>`).join(''):'<div class="empty-search">No matching pages</div>';results.classList.add('show')});results.addEventListener('click',e=>{let item=e.target.closest('[data-goto]');if(!item)return;location.hash=item.dataset.goto;input.value='';results.classList.remove('show')});input.addEventListener('keydown',e=>{if(e.key==='Enter'){let item=results.querySelector('[data-goto]');if(item){location.hash=item.dataset.goto;input.value='';results.classList.remove('show')}}if(e.key==='Escape')results.classList.remove('show')});document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))results.classList.remove('show')});

const docsToggle=document.getElementById('docs-mobile-toggle');if(docsToggle)docsToggle.addEventListener('click',()=>{const open=document.getElementById('docs-sidebar').classList.toggle('open');docsToggle.setAttribute('aria-expanded',String(open));});
