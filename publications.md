---
layout: default
class: publications-page
---

# Publications

<div class="publications-timeline">
  <!-- Dynamically add the current year -->
  <div class="publication-entry first">
    <div class="year-marker" id="current-year"></div>
  </div>

  <!-- Publication for 2022 -->
  <div class="publication-item" data-date="November 7, 2022">
    <div class="paper-info">
      <h3>Assessing the Impact of Transformations on Physical Adversarial Attacks</h3>
      
      <div class="meta-info">
        <div class="conference">AISec'22: Proceedings of the 15th ACM Workshop on Artificial Intelligence and Security</div>
        <div class="authors">Paul-Andrei Sava, Jan Philipp Schulze, Philip Sperl, Konstantin Böttinger</div>
      </div>
      
      <div class="paper-actions">
        <button class="action-button abstract-button">
          <i class="fas fa-book-open"></i>
          View Abstract
        </button>
        <a href="https://dl.acm.org/doi/abs/10.1145/3560830.3563733" class="action-button pdf-button">
          <i class="fas fa-file-pdf"></i>
          PDF
        </a>
      </div>
      
      <div class="paper-abstract" style="display: none;">
        <p>The decision of neural networks is easily shifted at an attacker's will by so-called adversarial attacks. Initially only successful when directly applied to the input, recent advances allow attacks to breach the digital realm, leading to over-the-air physical adversarial attacks. During training, some physical phenomena are simulated through equivalent transformations to increase the attack's success. In our work, we evaluate the impact of the selected transformations on the performance of physical adversarial attacks. We quantify their performance across diverse attack scenarios, e.g., multiple distances and angles. Our evaluation motivates that some transformations are indeed essential for successful attacks, no matter the target class. These also appear to be responsible for creating shapes within the attacks, which are semantically related to the target class. However, they do not ensure physical robustness alone. The choice of the remaining transformations appears to be context-dependent, e.g., some being more advantageous for long-range attacks, but not for close-range ones. With our findings, we not only provide useful information on generating physical adversarial attacks, but also help research on defenses to understand their weaknesses.</p>
      </div>
    </div>
  </div>

  <!-- Year 2022 -->
  <div class="publication-entry">
    <div class="year-marker">2022</div>
  </div>
</div>

<script>
  // Set the current year dynamically
  document.getElementById('current-year').textContent = new Date().getFullYear();

  document.querySelectorAll('.abstract-button').forEach(button => {
    button.addEventListener('click', function() {
      const abstract = this.closest('.paper-info').querySelector('.paper-abstract');
      if (abstract.style.display === 'none') {
        abstract.style.display = 'block';
        this.innerHTML = '<i class="fas fa-book"></i> Hide Abstract';
        this.classList.add('active');
      } else {
        abstract.style.display = 'none';
        this.innerHTML = '<i class="fas fa-book-open"></i> View Abstract';
        this.classList.remove('active');
      }
    });
  });
</script>


