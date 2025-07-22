import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AboutPage.css';
import PublicHeader from '../../components/common/PublicHeader';

function AboutPage() {
  const navigate = useNavigate();

  const stats = [
    { number: '15+', label: 'Năm kinh nghiệm' },
    { number: '50K+', label: 'Khách hàng tin tưởng' },
    { number: '100K+', label: 'Đầu sách đa dạng' },
    { number: '24/7', label: 'Hỗ trợ khách hàng' }
  ];

  const values = [
    {
      icon: '📚',
      title: 'Tri thức cho mọi người',
      description: 'Chúng tôi tin rằng tri thức là chìa khóa mở ra cánh cửa tương lai. Mọi người đều có quyền tiếp cận với những cuốn sách chất lượng.'
    },
    {
      icon: '🤝',
      title: 'Uy tín và chất lượng',
      description: '15 năm hoạt động với cam kết cung cấp sách chính hãng, chất lượng cao và dịch vụ khách hàng tốt nhất.'
    },
    {
      icon: '💡',
      title: 'Đổi mới không ngừng',
      description: 'Luôn cập nhật công nghệ mới, cải tiến dịch vụ để mang đến trải nghiệm mua sắm tốt nhất cho khách hàng.'
    },
    {
      icon: '❤️',
      title: 'Tận tâm phục vụ',
      description: 'Đội ngũ nhân viên nhiệt tình, am hiểu sách vở, sẵn sàng tư vấn và hỗ trợ khách hàng mọi lúc.'
    }
  ];



  const milestones = [
    {
      year: '2009',
      title: 'Thành lập Nhà Sách Cánh Diều',
      description: 'Bắt đầu với một cửa hàng nhỏ tại trung tâm thành phố.'
    },
    {
      year: '2012',
      title: 'Mở rộng chuỗi cửa hàng',
      description: 'Phát triển thành chuỗi 5 cửa hàng tại các quận trung tâm.'
    },
    {
      year: '2015',
      title: 'Xây dựng website bán hàng',
      description: 'Bắt đầu kinh doanh online và phục vụ khách hàng toàn quốc.'
    },
    {
      year: '2018',
      title: 'Trở thành đối tác chính thức',
      description: 'Ký kết hợp tác với các nhà xuất bản lớn trong và ngoài nước.'
    },
    {
      year: '2022',
      title: 'Ứng dụng công nghệ mới',
      description: 'Triển khai hệ thống quản lý hiện đại và dịch vụ khách hàng 24/7.'
    },
    {
      year: '2024',
      title: 'Hướng tới tương lai',
      description: 'Tiếp tục mở rộng và phát triển bền vững trong thời đại số.'
    }
  ];

  return (
    <div className="about-page">
      <PublicHeader />
      
      <div className="about-container">
        {/* Hero Section */}
        <section className="about-hero">
          <div className="hero-content">
            <h1>Về Nhà Sách Cánh Diều</h1>
            <p className="hero-subtitle">
              Hành trình 15 năm mang tri thức đến mọi người
            </p>
            <p className="hero-description">
              Từ một cửa hàng nhỏ năm 2009, Nhà Sách Cánh Diều đã phát triển thành 
              một trong những địa chỉ tin cậy hàng đầu về sách tại Việt Nam. 
              Chúng tôi tự hào mang đến cho độc giả những cuốn sách chất lượng, 
              dịch vụ tận tâm và trải nghiệm mua sắm tuyệt vời.
            </p>
            <button 
              className="btn-explore"
              onClick={() => navigate('/books')}
            >
              Khám phá sách ngay
            </button>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <span className="bookstore-icon">📚</span>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-stats">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="about-mission">
          <div className="mission-content">
            <div className="mission-item">
              <h2>Sứ mệnh</h2>
              <p>
                Nhà Sách Cánh Diều cam kết mang đến cho độc giả Việt Nam những cuốn sách 
                chất lượng cao, đa dạng về thể loại và phù hợp với mọi lứa tuổi. 
                Chúng tôi tin rằng mỗi cuốn sách là một cánh cửa mở ra thế giới mới, 
                giúp con người phát triển toàn diện và xây dựng một xã hội học tập.
              </p>
            </div>
            <div className="mission-item">
              <h2>Tầm nhìn</h2>
              <p>
                Trở thành nhà sách hàng đầu Việt Nam, là địa chỉ tin cậy cho việc 
                tìm kiếm và mua sách của mọi đối tượng độc giả. Chúng tôi mong muốn 
                góp phần xây dựng một cộng đồng yêu sách, ham học hỏi và phát triển 
                bền vững trong tương lai.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="about-values">
          <h2>Giá trị cốt lõi</h2>
          <div className="values-grid">
            {values.map((value, index) => (
              <div key={index} className="value-item">
                <div className="value-icon">{value.icon}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* History Section */}
        <section className="about-history">
          <h2>Lịch sử phát triển</h2>
          <div className="timeline">
            {milestones.map((milestone, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <div className="timeline-year">{milestone.year}</div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-contact">
          <h2>Liên hệ với chúng tôi</h2>
          <div className="contact-info-card">
            <div className="contact-details">
              <div className="contact-column">
                <div className="contact-detail">
                  <div className="detail-icon">📍</div>
                  <div className="detail-content">
                    <h4>Địa chỉ cửa hàng</h4>
                    <p>123 Đường ABC, Quận 1, TP. Hồ Chí Minh</p>
                    <p>Chi nhánh 1: 456 Đường XYZ, Quận 3, TP. Hồ Chí Minh</p>
                    <p>Chi nhánh 2: 789 Đường DEF, Quận 7, TP. Hồ Chí Minh</p>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="detail-icon">📞</div>
                  <div className="detail-content">
                    <h4>Điện thoại</h4>
                    <p>Hotline: 028 1234 5678</p>
                    <p>Hỗ trợ: 028 1234 5679</p>
                    <p>Khiếu nại: 028 1234 5680</p>
                  </div>
                </div>
              </div>
              <div className="contact-column">
                <div className="contact-detail">
                  <div className="detail-icon">✉️</div>
                  <div className="detail-content">
                    <h4>Email</h4>
                    <p>Thông tin: info@nhasachcanhdieu.com</p>
                    <p>Hỗ trợ: support@nhasachcanhdieu.com</p>
                    <p>Kinh doanh: business@nhasachcanhdieu.com</p>
                  </div>
                </div>
                <div className="contact-detail">
                  <div className="detail-icon">🕒</div>
                  <div className="detail-content">
                    <h4>Giờ làm việc</h4>
                    <p>Thứ 2 - Thứ 6: 8:00 - 21:00</p>
                    <p>Thứ 7 - Chủ nhật: 8:00 - 22:00</p>
                    <p>Ngày lễ: 9:00 - 20:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage; 