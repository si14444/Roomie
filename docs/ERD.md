# Roomie 앱 ERD (Entity Relationship Diagram)

```mermaid
erDiagram
    %% 엔티티 정의
    User {
        string id PK
        string email
        string full_name
        string avatar_url
        string provider
        string provider_id
        datetime created_at
        datetime updated_at
    }

    Team {
        string id PK
        string name
        string description
        string invite_code UK
        datetime created_at
        datetime updated_at
        string created_by FK
    }

    TeamMember {
        string id PK
        string team_id FK
        string user_id FK
        string role
        datetime joined_at
    }

    Routine {
        string id PK
        string team_id FK
        string title
        string description
        string category
        string frequency
        json frequency_details
        string assigned_to FK
        string priority
        boolean is_active
        datetime created_at
        datetime updated_at
        string created_by FK
    }

    RoutineCompletion {
        string id PK
        string routine_id FK
        string completed_by FK
        datetime completed_at
        string notes
        date due_date
        boolean is_late
    }

    Bill {
        string id PK
        string team_id FK
        string title
        string description
        decimal total_amount
        string category
        date due_date
        boolean is_recurring
        string recurring_period
        datetime created_at
        datetime updated_at
        string created_by FK
    }

    BillPayment {
        string id PK
        string bill_id FK
        string user_id FK
        decimal amount
        datetime paid_at
        string payment_method
        string notes
    }

    Item {
        string id PK
        string team_id FK
        string name
        string description
        string category
        integer current_quantity
        integer min_quantity
        string unit
        decimal estimated_price
        string preferred_store
        datetime last_purchased_at
        string last_purchased_by FK
        datetime created_at
        datetime updated_at
        string created_by FK
    }

    PurchaseRequest {
        string id PK
        string team_id FK
        string item_id FK
        string requested_by FK
        integer quantity
        string urgency
        string notes
        string status
        string approved_by FK
        datetime approved_at
        string purchased_by FK
        datetime purchased_at
        datetime created_at
        datetime updated_at
    }

    Notification {
        string id PK
        string team_id FK
        string user_id FK
        string title
        string message
        string type
        string related_id
        json action_data
        boolean is_read
        datetime created_at
    }

    Feedback {
        string id PK
        string team_id FK
        string user_id FK
        string month
        integer rating
        string comment
        datetime created_at
    }

    %% 관계 정의
    User ||--o{ TeamMember : "has"
    User ||--o{ Team : "creates"
    User ||--o{ Routine : "assigned_to"
    User ||--o{ Routine : "creates"
    User ||--o{ RoutineCompletion : "completes"
    User ||--o{ Bill : "creates"
    User ||--o{ BillPayment : "pays"
    User ||--o{ Item : "creates"
    User ||--o{ Item : "purchases"
    User ||--o{ PurchaseRequest : "requests"
    User ||--o{ PurchaseRequest : "approves"
    User ||--o{ PurchaseRequest : "purchases"
    User ||--o{ Notification : "receives"
    User ||--o{ Feedback : "provides"

    Team ||--o{ TeamMember : "has_members"
    Team ||--o{ Routine : "contains"
    Team ||--o{ Bill : "has_bills"
    Team ||--o{ Item : "manages"
    Team ||--o{ PurchaseRequest : "handles"
    Team ||--o{ Notification : "sends"
    Team ||--o{ Feedback : "receives"

    Routine ||--o{ RoutineCompletion : "completed_through"

    Bill ||--o{ BillPayment : "paid_through"

    Item ||--o{ PurchaseRequest : "requested_through"
```

## 엔티티별 주요 특징

### 핵심 엔티티
1. **User** (사용자) - 앱의 기본 사용자 정보
2. **Team** (팀) - 룸메이트 그룹
3. **TeamMember** (팀 멤버) - 사용자와 팀의 다대다 관계

### 기능별 엔티티
1. **Routine & RoutineCompletion** - 루틴 관리 및 완료 기록
2. **Bill & BillPayment** - 공과금 관리 및 결제 추적
3. **Item & PurchaseRequest** - 생필품 관리 및 구매 요청
4. **Notification** - 알림 시스템
5. **Feedback** - 월별 피드백 시스템

### 주요 관계
- **User ↔ Team**: 다대다 관계 (TeamMember 테이블로 연결)
- **Team → Features**: 일대다 관계 (모든 기능은 팀 단위)
- **완료/결제 추적**: 각 기능별로 별도 추적 테이블 존재

## 데이터베이스 설계 원칙
- 모든 ID는 UUID 사용
- 소프트 딜리트는 별도 필드 사용하지 않음 (완전 삭제)
- 팀 단위 격리 (Row Level Security)
- 생성자 및 수정자 추적
- 타임스탬프 자동 관리