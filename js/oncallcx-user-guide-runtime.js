const GUIDE_FILES = {
  outbound: {
    key: 'outbound',
    label: 'OUTBOUND',
    subtitle: 'Gọi ra - Chiến dịch - Campaign',
    icon: '☎',
    accent: 'orange',
    size: '3.6 MB',
    pdf: 'assets/user-guide/oncallcx/OnCallCX-UserGuide-Outbound-2025.pdf',
    title: 'User Guide - OUTBOUND',
    summary: 'Hướng dẫn sử dụng tính năng gọi ra, quản lý danh sách khách hàng, campaign, agent và báo cáo trên hệ thống OnCallCX.',
    toc: [
      ['login', 'Đăng nhập'],
      ['home', 'Trang chủ'],
      ['customers', 'Danh sách khách hàng'],
      ['campaign', 'Chiến dịch'],
      ['assignment', 'Phân công khách hàng'],
      ['agent', 'Giao diện Agent Outbound'],
      ['reports', 'Báo cáo'],
      ['voicebot', 'Chiến dịch Voicebot']
    ],
    sections: [
      {
        id: 'login',
        no: '1',
        title: 'Đăng nhập',
        kicker: 'Chương 1',
        text: 'Người dùng đăng nhập vào OnCallCX bằng tài khoản được Quản trị viên cấp.',
        steps: [
          'Mở trình duyệt Chrome/Edge và truy cập URL OnCallCX.',
          'Nhập Tên đăng nhập và Mật khẩu.',
          'Nhấn Đăng nhập để vào hệ thống.',
          'Sau khi đăng nhập thành công, hệ thống chuyển đến Trang chủ.',
          'Nếu là lần đầu đăng nhập, hệ thống có thể yêu cầu đổi mật khẩu mặc định.'
        ],
        notes: [{type: 'tip', text: 'Nên dùng Chrome/Edge bản mới để đảm bảo pop-up, mic và softphone hoạt động ổn định.'}]
      },
      {
        id: 'home',
        no: '2',
        title: 'Trang chủ',
        kicker: 'Chương 2',
        text: 'Trang chủ hiển thị tổng quan các chiến dịch gọi ra, thống kê cuộc gọi trong ngày và trạng thái hàng đợi Outbound.',
        cards: [
          ['Dashboard tổng quan', 'Tổng cuộc gọi, cuộc gọi thành công, cuộc gọi nhỡ trong ngày.'],
          ['Danh sách chiến dịch', 'Liệt kê campaign Outbound đang chạy và trạng thái Active/Paused/Completed.'],
          ['Biểu đồ theo giờ', 'Phân bổ cuộc gọi theo khung giờ trong ngày hiện tại.'],
          ['Menu điều hướng', 'Trang chủ, Danh sách KH, Chiến dịch, Báo cáo, Cài đặt.']
        ]
      },
      {
        id: 'customers',
        no: '3',
        title: 'Danh sách khách hàng',
        kicker: 'Chương 3',
        text: 'Quản lý Attribute, template danh sách khách hàng và tập khách hàng dùng cho chiến dịch Outbound.',
        subsections: [
          {
            title: '3.1 Thuộc tính khách hàng (Attribute)',
            text: 'Attribute là trường thông tin tuỳ chỉnh của khách hàng, ví dụ: tên, email, số điện thoại, hạn mức, phân khúc.',
            steps: [
              'Vào Danh sách khách hàng -> Thuộc tính.',
              'Nhấn Tạo Attribute hoặc Tạo mới nhiều Attribute.',
              'Nhập tên Attribute, kiểu dữ liệu và trạng thái bắt buộc.',
              'Nhấn Lưu để tạo trường mới.',
              'Dùng Tìm kiếm/Làm mới để lọc danh sách Attribute đã tạo.',
              'Chỉ xoá Attribute khi chưa được gắn vào danh sách khách hàng nào.'
            ],
            fields: [
              ['Tên thuộc tính', 'Text', 'Tên hiển thị của trường thông tin.', 'Bắt buộc'],
              ['Mã thuộc tính', 'Text', 'Mã định danh nội bộ, nên viết không dấu/không khoảng trắng.', 'Khuyến nghị'],
              ['Data Type', 'Dropdown', 'Text, Number, Date, Dropdown, Boolean, Phone, Email.', 'Bắt buộc'],
              ['Bắt buộc', 'Boolean', 'Nếu bật, mỗi khách hàng phải có dữ liệu ở trường này.', 'Tuỳ chọn'],
              ['Giá trị dropdown', 'List', 'Danh sách giá trị nếu Data Type là Dropdown.', 'Theo kiểu dữ liệu']
            ]
          },
          {
            title: '3.2 Tạo danh sách khách hàng',
            text: 'Danh sách khách hàng có thể tạo từ template, import file Excel hoặc chọn các Attribute sẵn có.',
            steps: [
              'Vào Danh sách khách hàng -> Danh sách khách hàng.',
              'Nhấn Tạo mới.',
              'Nhập thông tin danh sách và chọn nguồn dữ liệu khách hàng.',
              'Chọn Attribute định danh khách hàng.',
              'Chuyển sang tab Danh sách Attribute và tick các trường cần dùng.',
              'Thiết lập bắt buộc/không bắt buộc và vị trí hiển thị.',
              'Nhấn Lưu để tạo danh sách.'
            ],
            fields: [
              ['Tên danh sách', 'Text', 'Tên tập khách hàng dùng để gắn vào campaign.', 'Bắt buộc'],
              ['Nguồn dữ liệu', 'Dropdown', 'Import hoặc chọn từ danh sách có sẵn.', 'Bắt buộc'],
              ['Attribute định danh', 'Dropdown', 'Trường dùng để nhận diện khách hàng duy nhất.', 'Bắt buộc'],
              ['Template DSKH', 'Dropdown', 'Mẫu danh sách khách hàng đã cấu hình trước.', 'Tuỳ chọn'],
              ['Danh sách Attribute', 'Multi-select', 'Các trường thông tin sẽ gắn vào danh sách.', 'Bắt buộc']
            ]
          }
        ]
      },
      {
        id: 'campaign',
        no: '4',
        title: 'Chiến dịch (Campaign)',
        kicker: 'Chương 4',
        tone: 'red',
        text: 'Campaign Outbound là tập hợp cấu hình cho một đợt gọi ra có chủ đích: danh sách số, lịch gọi, retry, script và agent.',
        steps: [
          'Vào menu Chiến dịch và chọn Tạo chiến dịch mới.',
          'Nhập Tên chiến dịch và Mô tả.',
          'Chọn Loại chiến dịch: Preview, Progressive hoặc Predictive.',
          'Chọn Danh sách khách hàng hoặc upload file số mới.',
          'Cấu hình Lịch gọi: ngày bắt đầu, ngày kết thúc, khung giờ gọi.',
          'Cấu hình Retry: số lần gọi lại và khoảng cách giữa các lần.',
          'Chọn Queue/Agent xử lý chiến dịch.',
          'Đính kèm Script hướng dẫn agent nếu có.',
          'Nhấn Lưu & Kích hoạt hoặc Lưu nháp.'
        ],
        fields: [
          ['Tên chiến dịch', 'Text', 'Tên nhận diện campaign, ví dụ CSAT T11/2025.', 'Bắt buộc'],
          ['Loại chiến dịch', 'Dropdown', 'Preview / Progressive / Predictive Dialer.', 'Bắt buộc'],
          ['Danh sách KH', 'Upload/Select', 'File Excel hoặc danh sách có sẵn.', 'Bắt buộc'],
          ['Ngày bắt đầu', 'Date', 'Ngày campaign bắt đầu gọi.', 'Bắt buộc'],
          ['Ngày kết thúc', 'Date', 'Ngày campaign tự động dừng.', 'Bắt buộc'],
          ['Khung giờ gọi', 'Time Range', 'Ví dụ 08:00 - 21:00, không gọi ngoài giờ này.', 'Bắt buộc'],
          ['Số lần retry', 'Number', 'Tối đa số lần gọi lại nếu khách hàng không bắt máy.', 'Tuỳ chọn'],
          ['Khoảng retry', 'Number', 'Thời gian chờ giữa hai lần gọi lại.', 'Tuỳ chọn'],
          ['Queue xử lý', 'Dropdown', 'Hàng đợi/nhóm agent thực hiện cuộc gọi.', 'Bắt buộc'],
          ['Script', 'Rich Text', 'Kịch bản hướng dẫn agent khi gọi ra.', 'Tuỳ chọn']
        ],
        callouts: [
          ['Preview', 'Agent xem thông tin KH trước, sau đó chủ động nhấn Gọi. Phù hợp tư vấn phức tạp, KH VIP.'],
          ['Progressive', 'Hệ thống tự động gọi theo thứ tự, kết nối ngay khi agent sẵn sàng. Phù hợp telesales, CSAT.'],
          ['Predictive', 'AI dự đoán tỷ lệ bắt máy và gọi đồng thời nhiều số. Phù hợp chiến dịch số lượng lớn.']
        ],
        status: [
          ['Nháp', 'Đã lưu, chưa kích hoạt'],
          ['Đang chạy', 'Đang thực hiện gọi ra'],
          ['Tạm dừng', 'Đã dừng, có thể tiếp tục'],
          ['Hoàn thành', 'Đã gọi hết danh sách'],
          ['Hết hạn', 'Quá ngày kết thúc']
        ]
      },
      {
        id: 'assignment',
        no: '5',
        title: 'Phân công khách hàng',
        kicker: 'Chương 5',
        text: 'Phân công khách hàng giúp chia tập số trong campaign cho agent thủ công hoặc tự động.',
        steps: [
          'Vào menu Phân công khách hàng thuộc Outbound.',
          'Tìm kiếm khách hàng theo chiến dịch, danh sách, trạng thái hoặc attribute.',
          'Chọn khách hàng cần phân công.',
          'Chọn chi nhánh/phòng ban có agent tham gia chiến dịch.',
          'Chọn Agent hoặc nhấn Phân công tự động.',
          'Nhấn Phân công để ghi nhận vào campaign.'
        ],
        fields: [
          ['Chiến dịch', 'Dropdown', 'Campaign cần phân công khách hàng.', 'Bắt buộc'],
          ['Danh sách KH', 'Dropdown', 'Tập khách hàng thuộc campaign.', 'Bắt buộc'],
          ['Chi nhánh/Phòng ban', 'Dropdown', 'Đơn vị có agent tham gia.', 'Bắt buộc'],
          ['Agent', 'Multi-select', 'Agent nhận khách hàng.', 'Theo cách phân công'],
          ['Số lượng phân công', 'Number', 'Số lượng khách hàng chia cho agent.', 'Tuỳ chọn']
        ]
      },
      {
        id: 'agent',
        no: '6',
        title: 'Giao diện Agent Outbound',
        kicker: 'Chương 6',
        text: 'Agent tham gia campaign, nhận khách hàng, gọi ra và cập nhật kết quả cuộc gọi.',
        steps: [
          'Vào Giám sát -> Chiến dịch cho cá nhân.',
          'Nhấn icon tham gia chiến dịch đang active.',
          'Chọn trạng thái Ready và ready kênh call.',
          'Nhấn Khách hàng tiếp theo hoặc chọn khách hàng trong danh sách.',
          'Nhấn số điện thoại/nhập số điện thoại và Gọi.',
          'Nhập thông tin cuộc gọi, workcode, kết quả và lịch hẹn gọi lại nếu có.',
          'Nhấn Lưu để ghi nhận kết quả.'
        ],
        fields: [
          ['Trạng thái agent', 'Dropdown', 'Ready/Not Ready để tham gia gọi.', 'Bắt buộc'],
          ['Kênh call', 'Toggle', 'Bật kênh thoại trước khi gọi.', 'Bắt buộc'],
          ['Kết quả gọi', 'Dropdown', 'Thành công, không bắt máy, sai số, hẹn gọi lại...', 'Bắt buộc'],
          ['Workcode', 'Dropdown', 'Mã phân loại kết quả/nhu cầu.', 'Tuỳ chọn'],
          ['Hẹn gọi lại', 'Datetime', 'Thời điểm cần gọi lại khách hàng.', 'Tuỳ chọn'],
          ['Ghi chú', 'Textarea', 'Nội dung trao đổi với khách hàng.', 'Tuỳ chọn']
        ]
      },
      {
        id: 'reports',
        no: '7',
        title: 'Báo cáo',
        kicker: 'Chương 7',
        text: 'Báo cáo Outbound hỗ trợ theo dõi hiệu quả campaign, agent, kết quả gọi và tỷ lệ kết nối.',
        steps: [
          'Vào menu Báo cáo.',
          'Chọn loại báo cáo cần xem.',
          'Nhập khoảng thời gian, chiến dịch, agent hoặc trạng thái.',
          'Nhấn Báo cáo để chạy dữ liệu.',
          'Nhấn Xuất Excel để tải kết quả.'
        ],
        fields: [
          ['Từ ngày/Đến ngày', 'Date range', 'Khoảng thời gian truy vấn.', 'Bắt buộc'],
          ['Chiến dịch', 'Dropdown', 'Lọc theo campaign.', 'Tuỳ chọn'],
          ['Agent', 'Dropdown', 'Lọc theo nhân sự gọi.', 'Tuỳ chọn'],
          ['Trạng thái cuộc gọi', 'Dropdown', 'Lọc theo kết quả gọi.', 'Tuỳ chọn']
        ]
      }
    ]
  },
  inbound: {
    key: 'inbound',
    label: 'INBOUND',
    subtitle: 'Gọi vào - IVR - Hàng đợi - Agent',
    icon: '📥',
    accent: 'blue',
    size: '4.8 MB',
    pdf: 'assets/user-guide/oncallcx/OnCallCX-UserGuide-Inbound-2025.pdf',
    title: 'User Guide - INBOUND',
    summary: 'Hướng dẫn cấu hình và vận hành tiếp nhận cuộc gọi, email/chat, ticket, workcode, SLA và báo cáo Inbound.',
    toc: [
      ['admin', 'Cấu hình Quản trị'],
      ['workcode', 'Workcode'],
      ['sla', 'SLA'],
      ['agent', 'Agent tiếp nhận'],
      ['ticket', 'Tạo Ticket'],
      ['customer', 'Khách hàng'],
      ['interaction', 'Tương tác'],
      ['reports', 'Báo cáo']
    ],
    sections: [
      {
        id: 'admin',
        no: '1',
        title: 'Cấu hình Quản trị',
        kicker: 'Chương 1',
        text: 'Quản trị viên cấu hình tài khoản, vai trò, nhánh/phòng ban, kênh tiếp nhận và phân phối cuộc gọi trước khi đưa Inbound vào vận hành.',
        steps: [
          'Tạo tài khoản và vai trò cho supervisor/agent.',
          'Tạo chi nhánh/phòng ban và thêm người dùng vào nhánh.',
          'Cấu hình kênh tiếp nhận cho từng user hoặc nhóm dịch vụ.',
          'Cấu hình phân phối cuộc gọi theo nhóm dịch vụ.',
          'Kiểm tra danh sách thành viên được phân công vào nhóm dịch vụ.'
        ],
        fields: [
          ['Tài khoản', 'Text', 'Username đăng nhập của agent/supervisor.', 'Bắt buộc'],
          ['Vai trò', 'Dropdown', 'Quyền truy cập theo nhóm chức năng.', 'Bắt buộc'],
          ['Chi nhánh/Phòng ban', 'Dropdown', 'Đơn vị quản lý agent.', 'Bắt buộc'],
          ['Kênh tiếp nhận', 'Multi-select', 'Call, Email, Chat, Zalo...', 'Bắt buộc'],
          ['Nhóm dịch vụ', 'Dropdown', 'Queue/skill group nhận cuộc gọi.', 'Bắt buộc']
        ]
      },
      {
        id: 'workcode',
        no: '2',
        title: 'Quản lý Workcode',
        kicker: 'Chương 2',
        text: 'Workcode dùng để phân loại yêu cầu, gắn SLA, dynamic form, người xử lý và kịch bản hỗ trợ.',
        steps: [
          'Vào Inbound -> Dữ liệu cơ sở -> Workcode.',
          'Chọn Workcode gốc nếu muốn tạo thêm nhánh con.',
          'Nhấn Tạo Workcode.',
          'Nhập tên, vị trí hiển thị, mô tả và phòng ban xử lý.',
          'Chọn người xử lý, Add info, SLA, bộ câu hỏi xác thực và link KB nếu có.',
          'Nhấn Lưu để tạo workcode.'
        ],
        fields: [
          ['Tên', 'Text', 'Tên workcode, không trùng trong cùng một nhánh.', 'Bắt buộc'],
          ['Vị trí', 'Number', 'Thứ tự hiển thị trong cây workcode.', 'Bắt buộc'],
          ['Nội dung', 'Textarea', 'Mô tả mục đích workcode.', 'Tuỳ chọn'],
          ['Phòng ban xử lý', 'Dropdown', 'Phòng ban tiếp nhận/xử lý ticket.', 'Tuỳ chọn'],
          ['Người xử lý', 'Dropdown', 'Agent trong phòng ban đã chọn.', 'Tuỳ chọn'],
          ['Add info', 'Dropdown', 'Dynamic form bổ sung thông tin.', 'Tuỳ chọn'],
          ['SLA', 'Dropdown', 'Ngưỡng cảnh báo thời gian xử lý.', 'Tuỳ chọn'],
          ['Ngưỡng cảnh báo', 'Number', 'Số ticket tối đa trước khi cảnh báo.', 'Tuỳ chọn'],
          ['Link KB', 'Dropdown', 'Kịch bản hỗ trợ/knowledge base liên quan.', 'Tuỳ chọn']
        ]
      },
      {
        id: 'sla',
        no: '3',
        title: 'Cấu hình SLA',
        kicker: 'Chương 3',
        text: 'SLA giúp theo dõi thời gian xử lý ticket/workcode và cảnh báo khi sắp quá hạn.',
        steps: [
          'Vào Inbound -> Dữ liệu cơ sở -> SLA.',
          'Nhấn Tạo mới.',
          'Nhập tên SLA, thời gian cảnh báo và thời gian quá hạn.',
          'Nhấn Lưu để tạo cấu hình.',
          'Chọn danh sách Workcode sử dụng SLA tương ứng.'
        ],
        fields: [
          ['Tên SLA', 'Text', 'Tên cấu hình SLA.', 'Bắt buộc'],
          ['Thời gian cảnh báo', 'Duration', 'Ngưỡng sắp quá hạn.', 'Bắt buộc'],
          ['Thời gian quá hạn', 'Duration', 'Ngưỡng quá hạn.', 'Bắt buộc'],
          ['Workcode áp dụng', 'Multi-select', 'Danh sách workcode gắn SLA.', 'Bắt buộc'],
          ['Mô tả', 'Textarea', 'Ghi chú nội bộ.', 'Tuỳ chọn']
        ]
      },
      {
        id: 'agent',
        no: '4',
        title: 'Agent tiếp nhận yêu cầu',
        kicker: 'Chương 4',
        text: 'Agent cần Ready workmode và ready kênh để nhận cuộc gọi/email/chat được phân bổ từ hàng đợi.',
        steps: [
          'Đăng nhập vào OnCallCX.',
          'Chuyển Workmode từ Not Ready sang Ready.',
          'Ready kênh call/email/chat cần tiếp nhận.',
          'Khi có cuộc gọi đến, đảm bảo trình duyệt cho phép pop-up và mic.',
          'Chấp nhận hoặc từ chối cuộc gọi theo thông báo trên màn hình.',
          'Nếu hệ thống nhận diện được khách hàng, chuyển đến màn hình tạo ticket.'
        ],
        fields: [
          ['Workmode', 'Dropdown', 'Ready/Not Ready của agent.', 'Bắt buộc'],
          ['Kênh tiếp nhận', 'Toggle', 'Call, Email, Chat...', 'Bắt buộc'],
          ['Microphone', 'Browser permission', 'Quyền dùng mic cho softphone.', 'Bắt buộc với Call'],
          ['Pop-up', 'Browser permission', 'Cho phép hiện thông báo/cuộc gọi đến.', 'Khuyến nghị']
        ],
        notes: [{type: 'warning', text: 'Nếu agent không ready kênh call hoặc browser chặn mic/pop-up, cuộc gọi có thể không hiện đúng.'}]
      },
      {
        id: 'ticket',
        no: '5',
        title: 'Tạo Ticket',
        kicker: 'Chương 5',
        text: 'Ticket ghi nhận yêu cầu của khách hàng, có thể tự động tạo draft khi tiếp nhận liên hệ Inbound.',
        steps: [
          'Kiểm tra tab Thông tin khách hàng.',
          'Nếu khách hàng vãng lai, nhập thông tin và lưu vào hệ thống.',
          'Chọn Workcode phù hợp với yêu cầu.',
          'Kiểm tra/bổ sung nội dung yêu cầu và nội dung phản hồi.',
          'Nhập các trường bắt buộc theo dynamic form.',
          'Nhấn Lưu để tạo ticket.',
          'Đặt lịch gọi lại hoặc gọi ra cho khách hàng nếu cần.'
        ],
        fields: [
          ['Khách hàng', 'Lookup/Text', 'Thông tin KH đã có hoặc nhập mới.', 'Bắt buộc'],
          ['Workcode', 'Dropdown', 'Phân loại yêu cầu.', 'Bắt buộc'],
          ['Nội dung yêu cầu', 'Textarea', 'Vấn đề/nhu cầu khách hàng.', 'Bắt buộc'],
          ['Nội dung phản hồi', 'Textarea', 'Hướng xử lý/phản hồi cho KH.', 'Tuỳ cấu hình'],
          ['Dynamic form', 'Form', 'Các trường Add info theo workcode.', 'Theo workcode'],
          ['Trạng thái ticket', 'Dropdown', 'Draft, Đang xử lý, Hoàn thành, Quá hạn...', 'Bắt buộc'],
          ['Lịch gọi lại', 'Datetime', 'Thời điểm liên hệ lại KH.', 'Tuỳ chọn']
        ]
      },
      {
        id: 'customer',
        no: '6',
        title: 'Thông tin khách hàng',
        kicker: 'Chương 6',
        text: 'Thông tin khách hàng gồm thông tin cơ bản và thông tin tuỳ chỉnh được quản trị viên cấu hình bằng dynamic form.',
        steps: [
          'Mở tab Thông tin khách hàng trong màn hình làm việc.',
          'Kiểm tra thông tin cơ bản: họ tên, giới tính, số điện thoại.',
          'Nhập thông tin tuỳ chỉnh nếu form yêu cầu.',
          'Thêm ghi chú/note tag nếu cần.',
          'Nhấn Lưu để cập nhật thông tin khách hàng.'
        ],
        fields: [
          ['Họ tên', 'Text', 'Tên đầy đủ của khách hàng.', 'Bắt buộc'],
          ['Số điện thoại', 'Phone', 'Số liên hệ/số gọi vào.', 'Bắt buộc'],
          ['Email', 'Email', 'Địa chỉ email liên hệ.', 'Tuỳ chọn'],
          ['Giới tính', 'Dropdown', 'Thông tin cơ bản của KH.', 'Tuỳ chọn'],
          ['Địa chỉ', 'Text', 'Địa chỉ cư trú/làm việc.', 'Tuỳ chọn'],
          ['Thông tin tuỳ chỉnh', 'Dynamic form', 'Các trường do admin cấu hình.', 'Theo form']
        ]
      },
      {
        id: 'interaction',
        no: '7',
        title: 'Lịch sử liên hệ và tương tác',
        kicker: 'Chương 7',
        text: 'Agent có thể xem lịch sử liên hệ của khách hàng theo phân hệ, kênh và trạng thái ticket.',
        steps: [
          'Mở tab Lịch sử liên hệ.',
          'Chọn phân hệ: Tất cả, Inbound hoặc Outbound.',
          'Lọc theo kênh: Email, Chat, Điện thoại...',
          'Lọc theo trạng thái ticket: Pending, Hoàn thành, Sắp quá hạn, Quá hạn.',
          'Click workcode hoặc ticket để xem chi tiết.'
        ],
        fields: [
          ['Phân hệ', 'Dropdown', 'Tất cả/Inbound/Outbound.', 'Tuỳ chọn'],
          ['Kênh', 'Dropdown', 'Call, Email, Chat...', 'Tuỳ chọn'],
          ['Trạng thái ticket', 'Dropdown', 'Pending, Hoàn thành, Sắp quá hạn, Quá hạn.', 'Tuỳ chọn'],
          ['Workcode', 'Link', 'Mở chi tiết tương tác theo workcode.', 'Tuỳ chọn']
        ]
      },
      {
        id: 'reports',
        no: '8',
        title: 'Báo cáo Inbound',
        kicker: 'Chương 8',
        text: 'Báo cáo Inbound gồm tương tác theo agent/workcode, hiệu suất, trạng thái agent, ticket, email và chat.',
        steps: [
          'Vào Báo cáo Inbound.',
          'Chọn loại báo cáo.',
          'Nhập tiêu chí lọc và khoảng thời gian hợp lệ.',
          'Nhấn Báo cáo để chạy dữ liệu.',
          'Nhấn Xuất Excel để tải kết quả .xlsx.',
          'Nhấn Làm mới để xoá điều kiện lọc.'
        ],
        fields: [
          ['Loại báo cáo', 'Dropdown', 'Tương tác, Hieu suat, Ticket, Email, Chat...', 'Bắt buộc'],
          ['Từ ngày/Đến ngày', 'Date range', 'Khoảng thời gian truy vấn.', 'Bắt buộc'],
          ['Agent/Đơn vị', 'Dropdown', 'Đối tượng cần thống kê.', 'Tuỳ chọn'],
          ['Workcode', 'Dropdown', 'Lọc theo mã phân loại.', 'Tuỳ chọn'],
          ['Kenh', 'Dropdown', 'Call, Email, Chat...', 'Tuỳ chọn']
        ]
      }
    ]
  }
};

let activeGuide = 'outbound';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

function isCcaasProductCenter() {
  const hash = window.location.hash || '';
  return hash === '#oncallcx-product-center-ccaas' ||
    hash.includes('oncallcx-product-center:prod-oncallcx-fpt') ||
    hash.includes('oncallcx-product-centerprod-oncallcx-fpt');
}

function currentGuide() {
  return GUIDE_FILES[activeGuide] || GUIDE_FILES.outbound;
}

function stepsMarkup(steps = [], tone = '') {
  return `<div class="ocx-guide-steps ${tone ? `tone-${esc(tone)}` : ''}">
    ${steps.map((step, idx) => `<div class="ocx-guide-step"><span>${idx + 1}</span><p>${esc(step)}</p></div>`).join('')}
  </div>`;
}

function fieldTableMarkup(fields = []) {
  if (!fields.length) return '';
  return `<div class="ocx-guide-table-wrap"><table class="ocx-guide-table">
    <thead><tr><th>Trường</th><th>Loại</th><th>Mô tả</th><th>Bắt buộc</th></tr></thead>
    <tbody>${fields.map(row => `<tr>${row.map(cell => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
  </table></div>`;
}

function cardsMarkup(cards = []) {
  if (!cards.length) return '';
  return `<div class="ocx-guide-mini-grid">${cards.map(([title, desc]) => `<article><b>${esc(title)}</b><p>${esc(desc)}</p></article>`).join('')}</div>`;
}

function calloutsMarkup(callouts = []) {
  if (!callouts.length) return '';
  return `<div class="ocx-guide-callouts">${callouts.map(([title, desc]) => `<article><b>${esc(title)}</b><p>${esc(desc)}</p></article>`).join('')}</div>`;
}

function statusMarkup(status = []) {
  if (!status.length) return '';
  return `<div class="ocx-guide-status">${status.map(([name, desc]) => `<span><b>${esc(name)}</b><small>${esc(desc)}</small></span>`).join('')}</div>`;
}

function notesMarkup(notes = []) {
  if (!notes.length) return '';
  return notes.map(note => `<div class="ocx-guide-note ${esc(note.type || 'tip')}"><b>${note.type === 'warning' ? 'Cảnh báo' : 'Mẹo'}</b>: ${esc(note.text)}</div>`).join('');
}

function subsectionMarkup(item, parentTone) {
  return `<section class="ocx-guide-subsection">
    <h4>${esc(item.title)}</h4>
    <p>${esc(item.text || '')}</p>
    ${stepsMarkup(item.steps || [], parentTone)}
    ${fieldTableMarkup(item.fields || [])}
    ${notesMarkup(item.notes || [])}
  </section>`;
}

function sectionMarkup(section, guide) {
  return `<article class="ocx-guide-section" id="ocx-guide-${esc(section.id)}">
    <header>
      <div class="ocx-guide-section-icon">${esc(section.no)}</div>
      <div>
        <span>${esc(section.kicker)}</span>
        <h3>${esc(section.title)}</h3>
      </div>
    </header>
    <div class="ocx-guide-body">
      <p>${esc(section.text || '')}</p>
      ${cardsMarkup(section.cards || [])}
      ${stepsMarkup(section.steps || [], section.tone || guide.accent)}
      ${fieldTableMarkup(section.fields || [])}
      ${calloutsMarkup(section.callouts || [])}
      ${statusMarkup(section.status || [])}
      ${notesMarkup(section.notes || [])}
      ${(section.subsections || []).map(item => subsectionMarkup(item, section.tone || guide.accent)).join('')}
    </div>
  </article>`;
}

function guideNavMarkup(guide) {
  return `<aside class="ocx-guide-toc">
    <b>Mục lục</b>
    ${guide.toc.map(([id, label], idx) => `<button type="button" data-ocx-guide-scroll="${esc(id)}"><span>${idx + 1}</span>${esc(label)}</button>`).join('')}
  </aside>`;
}

function guideMarkup(guide) {
  return `<div class="ocx-guide-shell ${guide.accent}">
    <div class="ocx-guide-switcher">
      ${Object.values(GUIDE_FILES).map(item => `<button class="${item.key === guide.key ? 'active' : ''} ${esc(item.accent)}" data-ocx-guide-kind="${esc(item.key)}">
        <span>${esc(item.icon)}</span>
        <b>${esc(item.label)}</b>
        <small>${esc(item.subtitle)}</small>
        <em>${esc(item.size)}</em>
      </button>`).join('')}
    </div>
    <section class="ocx-guide-hero">
      <div class="ocx-guide-doc-icon">${esc(guide.icon)}</div>
      <div>
        <h3>${esc(guide.title)}</h3>
        <p>${esc(guide.summary)}</p>
        <div class="ocx-guide-meta">
          <span>03/2025</span>
          <span>FPT Telecom International</span>
          <span>${esc(guide.size)}</span>
        </div>
      </div>
      <div class="ocx-guide-actions">
        <a class="btn btn-soft btn-link" href="${esc(guide.pdf)}" target="_blank" rel="noopener">Mở PDF</a>
        <a class="btn btn-primary btn-link" href="${esc(guide.pdf)}" download>Tải PDF</a>
      </div>
    </section>
    <div class="ocx-guide-layout">
      ${guideNavMarkup(guide)}
      <main class="ocx-guide-content">
        ${guide.sections.map(section => sectionMarkup(section, guide)).join('')}
      </main>
    </div>
  </div>`;
}

function bindGuide(root) {
  root.querySelectorAll('[data-ocx-guide-kind]').forEach(button => {
    button.addEventListener('click', () => {
      activeGuide = button.getAttribute('data-ocx-guide-kind') || 'outbound';
      renderGuide();
    });
  });
  root.querySelectorAll('[data-ocx-guide-scroll]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-ocx-guide-scroll');
      const target = id ? root.querySelector(`#ocx-guide-${id}`) : null;
      target?.scrollIntoView({behavior: 'smooth', block: 'start'});
    });
  });
}

function renderGuide() {
  if (!isCcaasProductCenter()) return;
  const root = document.querySelector('#ocxUserGuideRoot');
  if (!root) return;
  const guide = currentGuide();
  root.innerHTML = guideMarkup(guide);
  bindGuide(root);
}

function scheduleGuideRender() {
  setTimeout(renderGuide, 40);
  setTimeout(renderGuide, 220);
}

document.addEventListener('click', event => {
  const tab = event.target.closest?.('[data-ocx-tab="user-guide"]');
  if (tab) scheduleGuideRender();
});

window.addEventListener('hashchange', scheduleGuideRender);
window.addEventListener('DOMContentLoaded', scheduleGuideRender);
scheduleGuideRender();

