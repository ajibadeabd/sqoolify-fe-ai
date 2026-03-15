import type { Editor } from 'grapesjs'

export function registerSchoolBlocks(editor: Editor) {
  const bm = editor.BlockManager

  bm.add('school-hero', {
    label: 'Hero Section',
    category: 'School Sections',
    content: `
      <section style="background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: white; padding: 80px 40px; text-align: center; min-height: 400px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <h1 style="font-size: 48px; font-weight: 800; margin-bottom: 16px; max-width: 800px;">Welcome to Our School</h1>
        <p style="font-size: 20px; opacity: 0.9; margin-bottom: 32px; max-width: 600px;">Empowering students to achieve excellence through quality education and holistic development.</p>
        <div style="display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;">
          <a href="#" style="background: white; color: #1e3a5f; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">Apply Now</a>
          <a href="#" style="background: transparent; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; border: 2px solid white;">Learn More</a>
        </div>
      </section>
    `,
  })

  bm.add('school-features', {
    label: 'Features Grid',
    category: 'School Sections',
    content: `
      <section style="padding: 60px 40px; background: #f8fafc;">
        <div style="text-align: center; margin-bottom: 48px;">
          <p style="color: #2563eb; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Why Choose Us</p>
          <h2 style="font-size: 36px; font-weight: 700; color: #1e293b;">Our Key Features</h2>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 1100px; margin: 0 auto;">
          <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
            <div style="width: 56px; height: 56px; background: #dbeafe; border-radius: 12px; margin: 0 auto 16px; font-size: 24px; display: flex; align-items: center; justify-content: center;">📚</div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Quality Education</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Our curriculum meets international standards with experienced educators.</p>
          </div>
          <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
            <div style="width: 56px; height: 56px; background: #dcfce7; border-radius: 12px; margin: 0 auto 16px; font-size: 24px; display: flex; align-items: center; justify-content: center;">🔬</div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Modern Facilities</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">State-of-the-art labs, libraries, and sports facilities.</p>
          </div>
          <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center;">
            <div style="width: 56px; height: 56px; background: #fef3c7; border-radius: 12px; margin: 0 auto 16px; font-size: 24px; display: flex; align-items: center; justify-content: center;">🏆</div>
            <h3 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Track Record</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Consistently producing top performers in academics and sports.</p>
          </div>
        </div>
      </section>
    `,
  })

  bm.add('school-gallery', {
    label: 'Image Gallery',
    category: 'School Sections',
    content: `
      <section style="padding: 60px 40px;">
        <div style="text-align: center; margin-bottom: 48px;">
          <h2 style="font-size: 36px; font-weight: 700; color: #1e293b;">Campus Gallery</h2>
          <p style="color: #64748b; font-size: 16px;">Take a virtual tour of our beautiful campus</p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; max-width: 1100px; margin: 0 auto;">
          <img src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=300&fit=crop" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px;" alt="Campus" />
          <img src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px;" alt="Classroom" />
          <img src="https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop" style="width: 100%; height: 220px; object-fit: cover; border-radius: 12px;" alt="Library" />
        </div>
      </section>
    `,
  })

  bm.add('school-cta', {
    label: 'CTA Banner',
    category: 'School Sections',
    content: `
      <section style="background: #2563eb; color: white; padding: 60px 40px; text-align: center;">
        <h2 style="font-size: 32px; font-weight: 700; margin-bottom: 12px;">Ready to Join Our Community?</h2>
        <p style="font-size: 18px; opacity: 0.9; margin-bottom: 28px; max-width: 600px; margin-left: auto; margin-right: auto;">Admissions are now open. Take the first step towards your child's future.</p>
        <a href="#" style="background: white; color: #2563eb; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; display: inline-block;">Start Application</a>
      </section>
    `,
  })

  bm.add('school-testimonials', {
    label: 'Testimonials',
    category: 'School Sections',
    content: `
      <section style="padding: 60px 40px; background: #f8fafc;">
        <h2 style="font-size: 36px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 48px;">What Parents Say</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; max-width: 900px; margin: 0 auto;">
          <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #475569; font-size: 15px; line-height: 1.7; font-style: italic; margin-bottom: 20px;">"The school has been instrumental in my child's growth. Dedicated teachers and a nurturing environment."</p>
            <p style="font-weight: 600; color: #1e293b; font-size: 14px;">Adunni Balogun</p>
            <p style="color: #64748b; font-size: 13px;">Parent, JSS 2</p>
          </div>
          <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <p style="color: #475569; font-size: 15px; line-height: 1.7; font-style: italic; margin-bottom: 20px;">"Outstanding academic performance and excellent extracurricular programs."</p>
            <p style="font-weight: 600; color: #1e293b; font-size: 14px;">Chidi Kalu</p>
            <p style="color: #64748b; font-size: 13px;">Parent, SS 1</p>
          </div>
        </div>
      </section>
    `,
  })

  bm.add('school-team', {
    label: 'Team Grid',
    category: 'School Sections',
    content: `
      <section style="padding: 60px 40px;">
        <h2 style="font-size: 36px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 12px;">Our Leadership Team</h2>
        <p style="color: #64748b; font-size: 16px; text-align: center; margin-bottom: 48px;">Meet the people behind our success</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 900px; margin: 0 auto; text-align: center;">
          <div>
            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 16px;" alt="Principal" />
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b;">Dr. James Okafor</h3>
            <p style="color: #2563eb; font-size: 13px; font-weight: 500;">Principal</p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 16px;" alt="VP" />
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b;">Mrs. Fatima Yusuf</h3>
            <p style="color: #2563eb; font-size: 13px; font-weight: 500;">Vice Principal</p>
          </div>
          <div>
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; margin: 0 auto 16px;" alt="Dean" />
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b;">Mr. Emeka Nwosu</h3>
            <p style="color: #2563eb; font-size: 13px; font-weight: 500;">Dean of Studies</p>
          </div>
        </div>
      </section>
    `,
  })

  bm.add('school-stats', {
    label: 'Stats Counter',
    category: 'School Sections',
    content: `
      <section style="padding: 48px 40px; background: #1e293b; color: white;">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; max-width: 1000px; margin: 0 auto; text-align: center;">
          <div><p style="font-size: 40px; font-weight: 800; margin-bottom: 4px;">1,200+</p><p style="font-size: 14px; opacity: 0.8;">Students</p></div>
          <div><p style="font-size: 40px; font-weight: 800; margin-bottom: 4px;">85+</p><p style="font-size: 14px; opacity: 0.8;">Teachers</p></div>
          <div><p style="font-size: 40px; font-weight: 800; margin-bottom: 4px;">98%</p><p style="font-size: 14px; opacity: 0.8;">Pass Rate</p></div>
          <div><p style="font-size: 40px; font-weight: 800; margin-bottom: 4px;">25+</p><p style="font-size: 14px; opacity: 0.8;">Years</p></div>
        </div>
      </section>
    `,
  })

  bm.add('school-contact', {
    label: 'Contact Info',
    category: 'School Sections',
    content: `
      <section style="padding: 60px 40px;">
        <h2 style="font-size: 36px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 48px;">Contact Us</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; max-width: 900px; margin: 0 auto;">
          <div style="text-align: center; padding: 32px; background: #f8fafc; border-radius: 12px;">
            <p style="font-size: 28px; margin-bottom: 12px;">📍</p>
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Address</h3>
            <p style="color: #64748b; font-size: 14px;">123 Education Lane, Victoria Island, Lagos</p>
          </div>
          <div style="text-align: center; padding: 32px; background: #f8fafc; border-radius: 12px;">
            <p style="font-size: 28px; margin-bottom: 12px;">📞</p>
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Phone</h3>
            <p style="color: #64748b; font-size: 14px;">+234 812 345 6789</p>
          </div>
          <div style="text-align: center; padding: 32px; background: #f8fafc; border-radius: 12px;">
            <p style="font-size: 28px; margin-bottom: 12px;">✉️</p>
            <h3 style="font-size: 16px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">Email</h3>
            <p style="color: #64748b; font-size: 14px;">info@ourschool.edu.ng</p>
          </div>
        </div>
      </section>
    `,
  })

  bm.add('school-faq', {
    label: 'FAQ Section',
    category: 'School Sections',
    content: `
      <section style="padding: 60px 40px; background: #f8fafc;">
        <h2 style="font-size: 36px; font-weight: 700; color: #1e293b; text-align: center; margin-bottom: 48px;">Frequently Asked Questions</h2>
        <div style="max-width: 700px; margin: 0 auto;">
          <div style="background: white; border-radius: 8px; margin-bottom: 12px; padding: 20px 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <h3 style="font-weight: 600; color: #1e293b; margin-bottom: 8px;">What are the admission requirements?</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.7;">Admission is based on entrance exam, previous records, and an interview.</p>
          </div>
          <div style="background: white; border-radius: 8px; margin-bottom: 12px; padding: 20px 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <h3 style="font-weight: 600; color: #1e293b; margin-bottom: 8px;">What extracurricular activities are available?</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.7;">We offer debate, coding, football, basketball, swimming, drama, and music.</p>
          </div>
          <div style="background: white; border-radius: 8px; padding: 20px 24px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <h3 style="font-weight: 600; color: #1e293b; margin-bottom: 8px;">What are the school hours?</h3>
            <p style="color: #64748b; font-size: 14px; line-height: 1.7;">7:30 AM to 3:30 PM, Monday through Friday. After-school until 5 PM.</p>
          </div>
        </div>
      </section>
    `,
  })

  bm.add('school-header', {
    label: 'School Header',
    category: 'School Sections',
    content: `
      <header style="background: white; padding: 16px 40px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; background: #2563eb; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 18px;">S</div>
          <span style="font-size: 20px; font-weight: 700; color: #1e293b;">School Name</span>
        </div>
        <nav style="display: flex; gap: 28px;">
          <a href="#" style="color: #475569; text-decoration: none; font-size: 15px; font-weight: 500;">Home</a>
          <a href="#" style="color: #475569; text-decoration: none; font-size: 15px; font-weight: 500;">About</a>
          <a href="#" style="color: #475569; text-decoration: none; font-size: 15px; font-weight: 500;">Admissions</a>
          <a href="#" style="color: #475569; text-decoration: none; font-size: 15px; font-weight: 500;">Contact</a>
        </nav>
      </header>
    `,
  })

  bm.add('school-footer', {
    label: 'School Footer',
    category: 'School Sections',
    content: `
      <footer style="background: #1e293b; color: white; padding: 40px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; max-width: 1000px; margin: 0 auto;">
          <div>
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">School Name</h3>
            <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">Providing quality education since 1999.</p>
          </div>
          <div>
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Quick Links</h3>
            <a href="#" style="display: block; color: #94a3b8; text-decoration: none; font-size: 14px; margin-bottom: 8px;">About Us</a>
            <a href="#" style="display: block; color: #94a3b8; text-decoration: none; font-size: 14px; margin-bottom: 8px;">Admissions</a>
            <a href="#" style="display: block; color: #94a3b8; text-decoration: none; font-size: 14px;">Contact</a>
          </div>
          <div>
            <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">Contact</h3>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">123 Education Lane, Lagos</p>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 8px;">+234 812 345 6789</p>
            <p style="color: #94a3b8; font-size: 14px;">info@ourschool.edu.ng</p>
          </div>
        </div>
        <div style="border-top: 1px solid #334155; margin-top: 32px; padding-top: 20px; text-align: center;">
          <p style="color: #64748b; font-size: 13px;">Powered by Sqoolify</p>
        </div>
      </footer>
    `,
  })
}
