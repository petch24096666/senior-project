import React, { useState, useEffect, useRef } from 'react';

const MessagePage = () => {
  // State variables
  const [messages, setMessages] = useState([
    { id: 1, sender: 'other', text: 'Hey there! How are you doing?', time: '10:30 AM', read: true },
    { id: 2, sender: 'me', text: 'I\'m good, thanks! Just working on some designs.', time: '10:32 AM', read: true },
    { id: 3, sender: 'other', text: 'That sounds interesting. Can you share some of your work?', time: '10:35 AM', read: true },
    { id: 4, sender: 'me', text: 'Sure! I\'ll send you some screenshots later today.', time: '10:36 AM', read: true },
    { id: 5, sender: 'other', text: 'Great! Looking forward to seeing them.', time: '10:38 AM', read: true },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState({ title: '', message: '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [contacts, setContacts] = useState([
    { id: 1, name: 'Jessica Williams', status: 'online', avatar: '/api/placeholder/40/40', unread: 2 },
    { id: 2, name: 'Michael Chen', status: 'offline', avatar: '/api/placeholder/40/40', unread: 0 },
    { id: 3, name: 'Sarah Johnson', status: 'away', avatar: '/api/placeholder/40/40', unread: 5 },
    { id: 4, name: 'David Miller', status: 'online', avatar: '/api/placeholder/40/40', unread: 0 },
    { id: 5, name: 'Emily Davis', status: 'online', avatar: '/api/placeholder/40/40', unread: 1 },
  ]);
  const [selectedContact, setSelectedContact] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef(null);
  const emojiList = ['😊', '👍', '❤️', '😂', '🎉', '🙏', '👋', '🔥', '✅', '⭐'];

  // Scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending new message
  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;
    
    const newMessageObj = {
      id: messages.length + 1,
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    
    setMessages([...messages, newMessageObj]);
    setNewMessage('');
    
    // Simulate received message after 2 seconds
    setTimeout(() => {
      const replyMessage = {
        id: messages.length + 2,
        sender: 'other',
        text: 'Thanks for your message! I\'ll get back to you soon.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      
      setMessages(prev => [...prev, replyMessage]);
      showNotification('New Message', `${contacts.find(c => c.id === selectedContact)?.name} sent you a message`);
    }, 2000);
  };

  // Show notification popup
  const showNotification = (title, message) => {
    setPopupMessage({ title, message });
    setShowPopup(true);
    
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  // Filter contacts based on search term
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add emoji to message
  const addEmoji = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Sidebar - Contact List */}
      <div style={{
        width: '25%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e5e5',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            margin: 0
          }}>Messages</h2>
          <div style={{
            cursor: 'pointer'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="1" />
              <circle cx="12" cy="5" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </div>
        </div>
        
        <div style={{
          padding: '8px',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <div style={{
            position: 'relative'
          }}>
            <input
              type="text"
              placeholder="Search conversations..."
              style={{
                width: '100%',
                padding: '8px',
                paddingLeft: '32px',
                borderRadius: '8px',
                backgroundColor: '#f5f5f5',
                border: 'none',
                outline: 'none'
              }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg 
              style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280'
              }}
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
        </div>
        
        <div style={{
          overflowY: 'auto',
          flex: 1
        }}>
          {filteredContacts.map(contact => (
            <div 
              key={contact.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px',
                borderBottom: '1px solid #f0f0f0',
                cursor: 'pointer',
                backgroundColor: selectedContact === contact.id ? '#ebf5ff' : 'transparent'
              }}
              onClick={() => setSelectedContact(contact.id)}
            >
              <div style={{
                position: 'relative',
                marginRight: '12px'
              }}>
                <img 
                  src={contact.avatar} 
                  alt={contact.name} 
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%'
                  }} 
                />
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  right: '0',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  border: '2px solid white',
                  backgroundColor: contact.status === 'online' ? '#22c55e' : 
                                  contact.status === 'away' ? '#eab308' : '#9ca3af'
                }}></span>
              </div>
              <div style={{
                flex: 1
              }}>
                <h3 style={{
                  fontWeight: '600',
                  margin: 0,
                  fontSize: '14px'
                }}>{contact.name}</h3>
                <p style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  margin: '4px 0 0 0',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>Click to view conversation</p>
              </div>
              {contact.unread > 0 && (
                <span style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}>
                  {contact.unread}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '12px',
          borderBottom: '1px solid #e5e5e5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <img 
              src={contacts.find(c => c.id === selectedContact)?.avatar} 
              alt="Contact" 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                marginRight: '12px'
              }} 
            />
            <div>
              <h3 style={{
                fontWeight: '600',
                margin: 0,
                fontSize: '16px'
              }}>{contacts.find(c => c.id === selectedContact)?.name}</h3>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                margin: '4px 0 0 0'
              }}>
                {contacts.find(c => c.id === selectedContact)?.status === 'online' ? 'Online' : 
                 contacts.find(c => c.id === selectedContact)?.status === 'away' ? 'Away' : 'Offline'}
              </p>
            </div>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* Phone Icon */}
            <div style={{ margin: '0 8px', cursor: 'pointer', color: '#4b5563' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </div>
            {/* Video Icon */}
            <div style={{ margin: '0 8px', cursor: 'pointer', color: '#4b5563' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="23 7 16 12 23 17 23 7"></polygon>
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
              </svg>
            </div>
            {/* Search Icon */}
            <div style={{ margin: '0 8px', cursor: 'pointer', color: '#4b5563' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            {/* More Icon */}
            <div style={{ margin: '0 8px', cursor: 'pointer', color: '#4b5563' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </div>
          </div>
        </div>
        
        {/* Messages Container */}
        <div style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          backgroundColor: '#f9fafb'
        }}>
          {messages.map(message => (
            <div 
              key={message.id} 
              style={{
                maxWidth: '320px',
                marginBottom: '16px',
                marginLeft: message.sender === 'me' ? 'auto' : '0'
              }}
            >
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: message.sender === 'me' ? '#3b82f6' : 'white',
                color: message.sender === 'me' ? 'white' : 'black',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
              }}>
                {message.text}
              </div>
              <div style={{
                fontSize: '12px',
                marginTop: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: message.sender === 'me' ? 'flex-end' : 'flex-start'
              }}>
                <span style={{ color: '#6b7280' }}>{message.time}</span>
                {message.sender === 'me' && (
                  <span style={{ marginLeft: '4px', color: '#3b82f6' }}>
                    {message.read ? '✓✓' : '✓'}
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message Input */}
        <div style={{
          padding: '12px',
          borderTop: '1px solid #e5e5e5',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            {/* Attachment button */}
            <button style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            
            {/* Emoji button */}
            <button style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              position: 'relative'
            }} onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
              
              {showEmojiPicker && (
                <div style={{
                  position: 'absolute',
                  bottom: '40px',
                  left: '0',
                  backgroundColor: 'white',
                  padding: '8px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e5e5e5',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '8px',
                  zIndex: 10
                }}>
                  {emojiList.map(emoji => (
                    <span 
                      key={emoji} 
                      style={{
                        fontSize: '20px',
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '4px',
                        textAlign: 'center',
                        ':hover': {
                          backgroundColor: '#f3f4f6'
                        }
                      }}
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              )}
            </button>
            
            {/* Image button */}
            <button style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
            
            {/* Message input */}
            <input
              type="text"
              placeholder="Type a message..."
              style={{
                flex: 1,
                padding: '8px',
                margin: '0 8px',
                borderRadius: '20px',
                backgroundColor: '#f5f5f5',
                border: 'none',
                outline: 'none'
              }}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            
            {/* Send button */}
            <button 
              style={{
                padding: '8px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={handleSendMessage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Notification Popup */}
      {showPopup && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e5e5e5',
          width: '256px',
          overflow: 'hidden',
          transition: 'all 0.3s',
          transform: 'translateY(0)',
          opacity: 1,
          zIndex: 50
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg 
                style={{ marginRight: '8px' }}
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span style={{ fontWeight: '600' }}>{popupMessage.title}</span>
            </div>
            <svg 
              style={{ cursor: 'pointer' }}
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              onClick={() => setShowPopup(false)}
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>
          <div style={{
            padding: '12px'
          }}>
            <p style={{
              fontSize: '14px',
              margin: 0
            }}>{popupMessage.message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagePage;